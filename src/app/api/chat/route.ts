import { StreamingTextResponse, Message } from 'ai';
import axios from 'axios';
import { RUNPOD_CONFIG, validateRunPodConfig } from '@/config/runpod';

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    
    // Validate RunPod configuration
    const { apiKey, endpointId } = validateRunPodConfig();
    
    const { messages } = await req.json();
    console.log('Messages received:', messages);

    // Convert messages to the format expected by your RunPod model
    const prompt = messages
      .map((message: Message) => `${message.role}: ${message.content}`)
      .join('\n');

    console.log('Sending request to RunPod...');
    const runResponse = await axios.post(
      `https://api.runpod.ai/v2/${endpointId}/run`,
      {
        input: {
          prompt,
          ...RUNPOD_CONFIG.model
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: RUNPOD_CONFIG.endpoint.timeout
      }
    );

    console.log('RunPod run response:', JSON.stringify(runResponse.data, null, 2));
    const jobId = runResponse.data.id;
    console.log('Job ID:', jobId);

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start polling for results in the background
    pollRunPodJob(jobId, writer, encoder, apiKey, endpointId).catch(async (error) => {
      console.error('Error polling RunPod:', error);
      await writer.write(encoder.encode(`Error: ${error.message}`));
      await writer.close();
    });

    return new StreamingTextResponse(stream.readable);
  } catch (error: any) {
    console.error('Error in POST handler:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    return new Response(
      JSON.stringify({
        error: error.response?.data || error.message,
        status: error.response?.status || 500,
        details: error.response?.data
      }),
      { 
        status: error.response?.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function pollRunPodJob(
  jobId: string,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  apiKey: string,
  endpointId: string
): Promise<void> {
  let attempts = 0;
  let lastStatus = '';

  while (attempts < RUNPOD_CONFIG.polling.max_attempts) {
    try {
      const response = await axios.get(
        `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: RUNPOD_CONFIG.endpoint.timeout
        }
      );

      const status = response.data.status;
      
      // Only log if status changed
      if (status !== lastStatus) {
        console.log('RunPod job status:', status);
        lastStatus = status;
      }

      switch (status) {
        case 'COMPLETED':
          const output = response.data.output;
          console.log('RunPod job completed with output:', output);
          
          // Process the output and stream it
          if (Array.isArray(output)) {
            for (const item of output) {
              if (item.choices && Array.isArray(item.choices) && item.choices[0]) {
                const choice = item.choices[0];
                if (choice.tokens && Array.isArray(choice.tokens)) {
                  const text = choice.tokens.join('');
                  await writer.write(encoder.encode(text));
                }
              }
            }
          }
          await writer.close();
          return;

        case 'FAILED':
          throw new Error(`RunPod job failed: ${response.data.error || 'Unknown error'}`);

        case 'IN_PROGRESS':
        case 'IN_QUEUE':
          // Job is still running, continue polling
          break;

        default:
          console.warn(`Unknown status: ${status}`);
      }

      // Wait for configured interval before polling again
      await new Promise(resolve => setTimeout(resolve, RUNPOD_CONFIG.polling.interval));
      attempts++;
    } catch (error: any) {
      console.error('Error checking job status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      // Don't throw here, just continue polling
    }
  }

  throw new Error(`Timeout waiting for RunPod job after ${RUNPOD_CONFIG.polling.max_attempts * RUNPOD_CONFIG.polling.interval / 1000} seconds. Last status: ${lastStatus}`);
} 