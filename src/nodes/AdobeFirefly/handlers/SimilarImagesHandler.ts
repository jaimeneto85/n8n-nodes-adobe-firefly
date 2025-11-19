import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class SimilarImagesHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Reference Image URL',
        name: 'referenceImageUrl',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['similarImages'],
          },
        },
        default: '',
        description: 'URL of the reference image',
        required: true,
      },
      {
        displayName: 'Reference Prompt',
        name: 'similarPrompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['similarImages'],
          },
        },
        default: '',
        description: 'Optional prompt to guide similar image generation',
      },
      {
        displayName: 'Number of Variations',
        name: 'similarVariations',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['similarImages'],
          },
        },
        default: 1,
        description: 'Number of similar images to generate',
        typeOptions: {
          minValue: 1,
          maxValue: 4,
        },
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

    const imageUrl = context.getNodeParameter('referenceImageUrl', itemIndex) as string;
    const prompt = context.getNodeParameter('similarPrompt', itemIndex) as string;
    const numberOfVariations = context.getNodeParameter('similarVariations', itemIndex) as number;

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      source: {
        uploadId: imageUrl,
      },
      n: numberOfVariations,
      ...(prompt && { prompt }),
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/images/generateSimilar',
      requestBody,
      accessToken,
    );

    return {
      jobId: response.id,
      status: response.status,
      similarImages: response.outputs,
      variations: numberOfVariations,
    };
  }
}

