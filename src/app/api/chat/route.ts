import { StreamingTextResponse, Message } from 'ai';
import axios from 'axios';

// Replace with your RunPod API key
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
// Replace with your RunPod endpoint ID
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    console.log('Environment variables:', {
      hasApiKey: !!RUNPOD_API_KEY,
      apiKeyLength: RUNPOD_API_KEY?.length,
      endpointId: RUNPOD_ENDPOINT_ID
    });

    const { messages } = await req.json();
    console.log('Messages received:', messages);

    // Convert messages to the format expected by your RunPod model
    const prompt = messages
      .map((message: Message) => `${message.role}: ${message.content}`)
      .join('\n');

    console.log('Sending request to RunPod...');
    const runResponse = await axios.post(
      `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`,
      {
        input: {
          prompt,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          stream: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
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
    pollRunPodJob(jobId, writer, encoder).catch(async (error) => {
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
  encoder: TextEncoder
): Promise<void> {
  const maxAttempts = 60;
  let attempts = 0;
  let lastStatus = '';

  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(
        `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${RUNPOD_API_KEY}`,
            'Content-Type': 'application/json',
          },
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

      // Wait for 3 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 3000));
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

  throw new Error(`Timeout waiting for RunPod job after ${maxAttempts * 3} seconds. Last status: ${lastStatus}`);
} 