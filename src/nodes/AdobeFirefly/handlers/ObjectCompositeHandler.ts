import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class ObjectCompositeHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Base Image URL',
        name: 'compositeBaseImage',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['objectComposite'],
          },
        },
        default: '',
        description: 'URL of the base image',
        required: true,
      },
      {
        displayName: 'Composite Prompt',
        name: 'compositePrompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['objectComposite'],
          },
        },
        default: '',
        description: 'Description of objects to composite into the image',
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

    const baseImage = context.getNodeParameter('compositeBaseImage', itemIndex) as string;
    const prompt = context.getNodeParameter('compositePrompt', itemIndex) as string;

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      source: {
        uploadId: baseImage,
      },
      prompt,
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/images/objectComposite',
      requestBody,
      accessToken,
    );

    return {
      jobId: response.id,
      status: response.status,
      compositeImage: response.outputs,
      prompt,
    };
  }
}

