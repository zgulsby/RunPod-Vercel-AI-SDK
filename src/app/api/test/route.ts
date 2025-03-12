import { NextResponse } from 'next/server';
import axios from 'axios';

// Log when the file is loaded
console.log('=== TEST ROUTE FILE LOADED ===');

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

// Log environment variables (without exposing sensitive data)
console.log('Environment check:', {
  hasApiKey: !!RUNPOD_API_KEY,
  apiKeyLength: RUNPOD_API_KEY?.length,
  endpointId: RUNPOD_ENDPOINT_ID
});

export async function GET() {
  console.log('=== TEST ENDPOINT HIT ===');
  
  // First, verify our environment variables
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    return NextResponse.json({
      success: false,
      message: 'Missing environment variables',
      details: {
        hasApiKey: !!RUNPOD_API_KEY,
        hasEndpointId: !!RUNPOD_ENDPOINT_ID
      }
    }, { status: 500 });
  }

  try {
    // Try to get the endpoint health status
    console.log('Checking endpoint health...');
    const healthResponse = await axios.get(
      `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/health`,
      {
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Health response:', healthResponse.data);

    // Try a simple test run
    console.log('Attempting test run...');
    const runResponse = await axios.post(
      `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`,
      {
        input: {
          prompt: "Test connection"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Run response:', runResponse.data);

    // If we get here, we successfully connected
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to RunPod',
      health: healthResponse.data,
      run: runResponse.data
    });

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    return NextResponse.json({
      success: false,
      message: error.message,
      details: error.response?.data,
      status: error.response?.status || 500,
      url: error.config?.url,
      env: {
        hasApiKey: !!RUNPOD_API_KEY,
        apiKeyLength: RUNPOD_API_KEY?.length,
        endpointId: RUNPOD_ENDPOINT_ID
      }
    }, { 
      status: error.response?.status || 500 
    });
  }
} 