import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AdobeFireflyApi implements ICredentialType {
  name = 'adobeFireflyApi';
  displayName = 'Adobe Firefly API';
  documentationUrl = 'https://developer.adobe.com/firefly-services/docs/firefly-api/';
  properties: INodeProperties[] = [
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Adobe Firefly API Client ID',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Adobe Firefly API Client Secret',
    },
  ];
}

