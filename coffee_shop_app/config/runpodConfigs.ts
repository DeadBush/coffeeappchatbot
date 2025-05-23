// Your RunPod endpoint ID
const ENDPOINT_ID = '63s5dlt1w7qgu4';

// Construct the proper RunPod API URL
const API_URL = `https://api.runpod.ai/v2/${ENDPOINT_ID}/run`;
const API_KEY = process.env.EXPO_PUBLIC_RUNPOD_API_KEY as string;

export { API_URL, API_KEY, ENDPOINT_ID };