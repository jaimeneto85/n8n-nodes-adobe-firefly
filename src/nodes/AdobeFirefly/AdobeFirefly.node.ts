import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow';

import { TextToImageHandler } from './handlers/TextToImageHandler';
import { TextToVideoHandler } from './handlers/TextToVideoHandler';
import { ExpandImageHandler } from './handlers/ExpandImageHandler';
import { FillImageHandler } from './handlers/FillImageHandler';
import { SimilarImagesHandler } from './handlers/SimilarImagesHandler';
import { ObjectCompositeHandler } from './handlers/ObjectCompositeHandler';

export class AdobeFirefly implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Adobe Firefly',
    name: 'adobeFirefly',
    icon: 'file:firefly-icon.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Generate creative content using Adobe Firefly API',
    defaults: {
      name: 'Adobe Firefly',
      color: '#FF0000',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'adobeFireflyApi',
        required: true,
        displayOptions: {
          show: {},
        },
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          {
            name: 'Image',
            value: 'image',
          },
          {
            name: 'Video',
            value: 'video',
          },
        ],
        default: 'image',
        description: 'The type of resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['image'],
          },
        },
        options: [
          {
            name: 'Generate',
            value: 'textToImage',
            description: 'Generate images from text prompts',
            action: 'Generate images from text',
          },
          {
            name: 'Expand',
            value: 'expandImage',
            description: 'Expand an image to larger dimensions',
            action: 'Expand an image',
          },
          {
            name: 'Fill',
            value: 'fillImage',
            description: 'Fill masked areas of an image',
            action: 'Fill image areas',
          },
          {
            name: 'Generate Similar',
            value: 'similarImages',
            description: 'Generate similar images from a reference',
            action: 'Generate similar images',
          },
          {
            name: 'Object Composite',
            value: 'objectComposite',
            description: 'Generate composite with objects',
            action: 'Generate composite image',
          },
        ],
        default: 'textToImage',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['video'],
          },
        },
        options: [
          {
            name: 'Generate Video',
            value: 'textToVideo',
            description: 'Generate videos from text prompts',
            action: 'Generate video from text',
          },
        ],
        default: 'textToVideo',
      },

      ...TextToImageHandler.getProperties(),
      ...TextToVideoHandler.getProperties(),
      ...ExpandImageHandler.getProperties(),
      ...FillImageHandler.getProperties(),
      ...SimilarImagesHandler.getProperties(),
      ...ObjectCompositeHandler.getProperties(),
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const responseData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        let result;

        if (resource === 'image') {
          switch (operation) {
            case 'textToImage':
              result = await TextToImageHandler.execute(this, i);
              break;
            case 'expandImage':
              result = await ExpandImageHandler.execute(this, i);
              break;
            case 'fillImage':
              result = await FillImageHandler.execute(this, i);
              break;
            case 'similarImages':
              result = await SimilarImagesHandler.execute(this, i);
              break;
            case 'objectComposite':
              result = await ObjectCompositeHandler.execute(this, i);
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
        } else if (resource === 'video') {
          switch (operation) {
            case 'textToVideo':
              result = await TextToVideoHandler.execute(this, i);
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
        }

        responseData.push({
          json: result as unknown as INodeExecutionData['json'] || {},
          pairedItem: i,
        });
      } catch (error) {
        if (this.continueOnFail()) {
          responseData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            } as unknown as INodeExecutionData['json'],
            pairedItem: i,
          });
        } else {
          throw error;
        }
      }
    }

    return [responseData];
  }
}

