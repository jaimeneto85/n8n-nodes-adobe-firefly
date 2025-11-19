import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class FillImageHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Image URL',
        name: 'fillImageUrl',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['fillImage'],
          },
        },
        default: '',
        description: 'URL or binary data of the image to fill',
        required: true,
      },
      {
        displayName: 'Mask URL',
        name: 'maskUrl',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['fillImage'],
          },
        },
        default: '',
        description: 'URL of the mask indicating areas to fill',
        required: true,
      },
      {
        displayName: 'Fill Prompt',
        name: 'fillPrompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['fillImage'],
          },
        },
        default: '',
        description: 'Description of what to fill in the masked areas',
        required: true,
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

    const imageUrl = context.getNodeParameter('fillImageUrl', itemIndex) as string;
    const maskUrl = context.getNodeParameter('maskUrl', itemIndex) as string;
    const prompt = context.getNodeParameter('fillPrompt', itemIndex) as string;

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      source: {
        uploadId: imageUrl,
      },
      mask: {
        uploadId: maskUrl,
      },
      prompt,
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/images/fill',
      requestBody,
      accessToken,
    );

    return {
      jobId: response.id,
      status: response.status,
      filledImage: response.outputs,
      prompt,
    };
  }
}

