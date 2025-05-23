import axios from 'axios';
import { MessageInterface } from '@/types/types';
import { API_KEY, API_URL, ENDPOINT_ID } from '@/config/runpodConfigs';

// Function to get the status URL for a job
const getStatusUrl = (jobId: string) => `https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${jobId}`;

// Function to wait for job completion
async function waitForJobCompletion(jobId: string, maxAttempts = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await axios.get(getStatusUrl(jobId), {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const status = response.data;
        console.log('Job status:', status);

        if (status.status === 'COMPLETED') {
            return status.output;
        }

        if (status.status === 'FAILED') {
            throw new Error(status.error || 'Job failed');
        }

        // Wait for 1 second before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Timeout waiting for job completion');
}

async function callChatBotAPI(messages: MessageInterface[]): Promise<MessageInterface> {
    try {
        if (!API_URL || !API_KEY) {
            throw new Error('API_URL or API_KEY is not configured');
        }

        // Ensure messages have the correct structure
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const requestPayload = {
            input: {
                messages: formattedMessages
            }
        };

        // Log the full request structure
        console.log('Sending request:', JSON.stringify(requestPayload, null, 2));
        console.log('API URL:', API_URL);

        // Submit the job
        const response = await axios.post(API_URL, requestPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            timeout: 3000000
        });
        
        console.log('Initial response:', JSON.stringify(response.data, null, 2));

        // Get the job ID and wait for completion
        const jobId = response.data.id;
        if (!jobId) {
            throw new Error('No job ID received from RunPod');
        }

        // Wait for the job to complete and get results
        const result = await waitForJobCompletion(jobId);
        console.log('Final result:', JSON.stringify(result, null, 2));

        if (!result) {
            throw new Error('No output received from RunPod');
        }

        return result as MessageInterface;

    } catch (error: any) {
        console.error('Full error object:', error);
        if (error.response?.data) {
            console.error('Error response:', error.response.data);
        }
        if (error.request) {
            console.error('Error request:', error.request);
        }
        console.error('Error config:', JSON.stringify({
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
        }, null, 2));
        
        throw error;
    }
}

export { callChatBotAPI };