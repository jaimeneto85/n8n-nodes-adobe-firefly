import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class ExpandImageHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Image URL',
        name: 'imageUrl',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['expandImage'],
          },
        },
        default: '',
        description: 'URL or binary data of the image to expand',
        required: true,
      },
      {
        displayName: 'Target Width',
        name: 'expandWidth',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['expandImage'],
          },
        },
        default: 1024,
        description: 'Target width of the expanded image',
        typeOptions: {
          minValue: 128,
          maxValue: 2048,
        },
      },
      {
        displayName: 'Target Height',
        name: 'expandHeight',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['expandImage'],
          },
        },
        default: 1024,
        description: 'Target height of the expanded image',
        typeOptions: {
          minValue: 128,
          maxValue: 2048,
        },
      },
      {
        displayName: 'Expansion Prompt',
        name: 'expandPrompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['expandImage'],
          },
        },
        default: '',
        description: 'Optional prompt to guide the expansion',
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

    const imageUrl = context.getNodeParameter('imageUrl', itemIndex) as string;
    const width = context.getNodeParameter('expandWidth', itemIndex) as number;
    const height = context.getNodeParameter('expandHeight', itemIndex) as number;
    const prompt = context.getNodeParameter('expandPrompt', itemIndex) as string;

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      source: {
        uploadId: imageUrl,
      },
      size: {
        width,
        height,
      },
      ...(prompt && { prompt }),
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/images/expand',
      requestBody,
      accessToken,
    );

    return {
      jobId: response.id,
      status: response.status,
      expandedImage: response.outputs,
      targetSize: { width, height },
    };
  }
}

