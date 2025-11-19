import { IExecuteFunctions } from 'n8n-workflow';

interface IApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class ApiClient {
  private static readonly BASE_URL = 'https://firefly-api.adobe.io/v3';
  private static readonly AUTH_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

  static async getAccessToken(
    _context: IExecuteFunctions,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'firefly_api,openid,AdobeID,read_organizations',
      }).toString(),
    };

    const response = await fetch(ApiClient.AUTH_URL, options);

    if (!response.ok) {
      throw new Error(`Failed to obtain access token: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  static async makeRequest(
    context: IExecuteFunctions,
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    accessToken?: string,
  ): Promise<IApiResponse> {
    const url = `${ApiClient.BASE_URL}${endpoint}`;
    const token = accessToken;

    if (!token) {
      throw new Error('Access token is required');
    }

    const credentials = await context.getCredentials('adobeFireflyApi');
    if (!credentials) {
      throw new Error('Credentials not found');
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-api-key': credentials.clientId as string,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    return (await response.json()) as IApiResponse;
  }

  static async pollJobStatus(
    context: IExecuteFunctions,
    jobId: string,
    accessToken: string,
    maxAttempts: number = 120,
    interval: number = 5000,
  ): Promise<IApiResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await ApiClient.makeRequest(
        context,
        'GET',
        `/generativeAssets/jobs/${jobId}`,
        undefined,
        accessToken,
      );

      if (response.status === 'SUCCEEDED') {
        return response;
      }

      if (response.status === 'FAILED') {
        throw new Error(`Job failed: ${response.failureDetails?.message || 'Unknown error'}`);
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Job polling timeout after ${maxAttempts} attempts`);
  }
}

