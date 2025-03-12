export const RUNPOD_CONFIG = {
  // Model configuration
  model: {
    max_tokens: 1000,    // Maximum length of the response
    temperature: 0.7,    // Controls randomness (0.0 to 1.0)
    top_p: 0.9,         // Controls diversity via nucleus sampling
    stream: true        // Enable streaming responses
  },

  // Endpoint configuration
  endpoint: {
    timeout: 30000,     // Timeout in milliseconds
    max_retries: 3,     // Number of retry attempts
    retry_delay: 1000   // Delay between retries in milliseconds
  },

  // Polling configuration
  polling: {
    interval: 3000,     // How often to check job status
    max_attempts: 60    // Maximum number of polling attempts
  }
};

// Helper function to validate RunPod configuration
export function validateRunPodConfig() {
  const { RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID } = process.env;
  
  if (!RUNPOD_API_KEY) {
    throw new Error('RUNPOD_API_KEY is not set in environment variables');
  }
  
  if (!RUNPOD_ENDPOINT_ID) {
    throw new Error('RUNPOD_ENDPOINT_ID is not set in environment variables');
  }
  
  return {
    apiKey: RUNPOD_API_KEY,
    endpointId: RUNPOD_ENDPOINT_ID
  };
} 