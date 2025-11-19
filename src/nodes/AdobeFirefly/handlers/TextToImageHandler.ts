import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { ApiClient } from '../../../utils/ApiClient';

export class TextToImageHandler {
  static getProperties(): INodeProperties[] {
    return [
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['textToImage'],
          },
        },
        default: '',
        description: 'Text description of the image to generate',
        required: true,
      },
      {
        displayName: 'Image Size',
        name: 'imageSize',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['textToImage'],
          },
        },
        options: [
          {
            name: '1024x1024',
            value: '1024x1024',
          },
          {
            name: '1152x896',
            value: '1152x896',
          },
          {
            name: '896x1152',
            value: '896x1152',
          },
          {
            name: '1344x768',
            value: '1344x768',
          },
          {
            name: '768x1344',
            value: '768x1344',
          },
          {
            name: '1456x912',
            value: '1456x912',
          },
          {
            name: '912x1456',
            value: '912x1456',
          },
        ],
        default: '1024x1024',
        description: 'Dimensions of the generated image',
      },
      {
        displayName: 'Number of Variations',
        name: 'numberOfVariations',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['textToImage'],
          },
        },
        default: 1,
        description: 'Number of images to generate',
        typeOptions: {
          minValue: 1,
          maxValue: 4,
        },
      },
      {
        displayName: 'Style',
        name: 'style',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['textToImage'],
          },
        },
        options: [
          {
            name: 'Auto',
            value: 'auto',
          },
          {
            name: 'Illustration',
            value: 'illustration',
          },
          {
            name: 'Photography',
            value: 'photography',
          },
          {
            name: '3D Art',
            value: '3D-art',
          },
          {
            name: 'Digital Painting',
            value: 'digital-painting',
          },
          {
            name: 'Graphic Design',
            value: 'graphic-design',
          },
        ],
        default: 'auto',
        description: 'Style to apply to generated images',
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

    const prompt = context.getNodeParameter('prompt', itemIndex) as string;
    const imageSize = context.getNodeParameter('imageSize', itemIndex) as string;
    const numberOfVariations = context.getNodeParameter('numberOfVariations', itemIndex) as number;
    const style = context.getNodeParameter('style', itemIndex) as string;

    const [width, height] = imageSize.split('x').map(Number);

    const clientId = credentials.clientId as string;
    const clientSecret = credentials.clientSecret as string;

    const accessToken = await ApiClient.getAccessToken(context, clientId, clientSecret);

    const requestBody = {
      prompt,
      n: numberOfVariations,
      size: {
        width,
        height,
      },
      style: {
        preset: style,
      },
    };

    const response = await ApiClient.makeRequest(
      context,
      'POST',
      '/images/generate',
      requestBody,
      accessToken,
    );

    return {
      jobId: response.id,
      status: response.status,
      images: response.outputs,
      prompt,
      size: imageSize,
      variations: numberOfVariations,
    };
  }
}

