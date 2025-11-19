import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class TextToVideoHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Prompt',
        name: 'videoPrompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
          },
        },
        default: '',
        description: 'Text description of the video to generate',
        required: true,
      },
      {
        displayName: 'Duration (seconds)',
        name: 'duration',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
          },
        },
        options: [
          {
            name: '5 seconds',
            value: 5,
          },
          {
            name: '10 seconds',
            value: 10,
          },
          {
            name: '15 seconds',
            value: 15,
          },
          {
            name: '20 seconds',
            value: 20,
          },
        ],
        default: 5,
        description: 'Duration of the generated video',
      },
      {
        displayName: 'Aspect Ratio',
        name: 'aspectRatio',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
          },
        },
        options: [
          {
            name: '16:9 (Landscape)',
            value: '16:9',
          },
          {
            name: '9:16 (Portrait)',
            value: '9:16',
          },
          {
            name: '1:1 (Square)',
            value: '1:1',
          },
        ],
        default: '16:9',
        description: 'Aspect ratio of the generated video',
      },
      {
        displayName: 'Style',
        name: 'videoStyle',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
          },
        },
        options: [
          {
            name: 'Auto',
            value: 'auto',
          },
          {
            name: 'Cinematic',
            value: 'cinematic',
          },
          {
            name: 'Documentary',
            value: 'documentary',
          },
          {
            name: 'Animated',
            value: 'animated',
          },
          {
            name: 'Photography',
            value: 'photography',
          },
        ],
        default: 'auto',
        description: 'Style to apply to generated video',
      },
      {
        displayName: 'Wait for Completion',
        name: 'waitForCompletion',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
          },
        },
        default: false,
        description: 'Wait for video generation to complete before returning',
      },
      {
        displayName: 'Poll Timeout (seconds)',
        name: 'pollTimeout',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['textToVideo'],
            waitForCompletion: [true],
          },
        },
        default: 600,
        description: 'Maximum time to wait for job completion in seconds',
      },
    ];
  }

  static async execute(
    context: IExecuteFunctions,
    itemIndex: number,
  ): Promise<Record<string, unknown>> {
    const credentials = await context.getCredentials('adobeFireflyApi');

    if (!credentials) {
      throw new Error('Adobe Firefly API credentials not found');
    }

    const prompt = context.getNodeParameter('videoPrompt', itemIndex) as string;
    const duration = context.getNodeParameter('duration', itemIndex) as number;
    const aspectRatio = context.getNodeParameter('aspectRatio', itemIndex) as string;
    const style = context.getNodeParameter('videoStyle', itemIndex) as string;
    const waitForCompletion = context.getNodeParameter('waitForCompletion', itemIndex) as boolean;
    const pollTimeout = context.getNodeParameter('pollTimeout', itemIndex) as number;

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      prompt,
      duration,
      aspectRatio,
      style: {
        preset: style,
      },
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/videos/generate',
      requestBody,
      accessToken,
    );

    const jobId = response.id;
    let result: Record<string, unknown> = {
      jobId,
      status: response.status,
      prompt,
      duration,
      aspectRatio,
      style,
    };

    if (waitForCompletion && response.status !== 'SUCCEEDED') {
      const maxAttempts = Math.ceil(pollTimeout / 5);
      const finalResponse = await ApiClient.pollJobStatus(
        context,
        jobId,
        accessToken,
        maxAttempts,
        5000,
      );

      result = {
        jobId,
        status: finalResponse.status,
        video: finalResponse.outputs,
        prompt,
        duration,
        aspectRatio,
        completedAt: new Date().toISOString(),
      };
    }

    return result;
  }
}

