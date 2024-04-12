import {GenerateContentRequest, RequestOptions} from '../../types';
import {postRequest} from '../post_request';

describe('postRequest', () => {
  const REGION = 'us-central1';
  const PROJECT = 'project-id';
  const RESOURCE_PATH = 'resource-path';
  const RESOURCE_METHOD = 'resource-method';
  const TOKEN = 'token';
  const API_ENDPOINT = 'api-endpoint.googleapis.com';
  const API_ENDPOINT_EXTERNAL = 'api-endpoint.external.com';
  const data = {} as GenerateContentRequest;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch').and.resolveTo({} as Response);
  });
  it('apiClient header contains line break type 1, should throw', async () => {
    const requestOptions: RequestOptions = {
      apiClient: 'apiClient\n',
    };
    const expectedErrorMessage =
      '[VertexAI.ClientError]: Found line break in apiClient request option field, please remove ' +
      'the line break and try again.';
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    }).catch(e => {
      expect(e.message).toEqual(expectedErrorMessage);
    });
  });
  it('apiClient header contains line break type 2, should throw', async () => {
    const requestOptions: RequestOptions = {
      apiClient: 'apiClient\r',
    };
    const expectedErrorMessage =
      '[VertexAI.ClientError]: Found line break in apiClient request option field, please remove ' +
      'the line break and try again.';
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    }).catch(e => {
      expect(e.message).toEqual(expectedErrorMessage);
    });
  });
  it('apiClient header correct, should call through', async () => {
    const requestOptions: RequestOptions = {
      apiClient: 'apiClient',
    };
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    });
    const actualHeaders = fetchSpy.calls.mostRecent().args[1].headers;
    expect(actualHeaders.get('X-Goog-Api-Client')).toEqual('apiClient');
  });
  it('customer object header contains line break type 1, should throw', async () => {
    const requestOptions: RequestOptions = {
      customHeaders: new Headers({customerHeader: 'apiClient\n'}),
    } as RequestOptions;
    const expectedErrorMessage =
      '[VertexAI.ClientError]: Found line break in customerHeaders request option field, please remove ' +
      'the line break and try again.';
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    }).catch(e => {
      expect(e.message).toEqual(expectedErrorMessage);
    });
  });
  it('customer object header contains line break type 2, should throw', async () => {
    const requestOptions: RequestOptions = {
      customHeaders: new Headers({customerHeader: 'apiClient\r'}),
    } as RequestOptions;
    const expectedErrorMessage =
      '[VertexAI.ClientError]: Found line break in customerHeaders request option field, please remove ' +
      'the line break and try again.';
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    }).catch(e => {
      expect(e.message).toEqual(expectedErrorMessage);
    });
  });
  it('set customer header correctly should call through', async () => {
    const requestOptions: RequestOptions = {
      customHeaders: new Headers({customerHeader: 'customerHeaderValue'}),
    } as RequestOptions;
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    });
    const actualHeaders = fetchSpy.calls.mostRecent().args[1].headers;
    expect(actualHeaders.get('customerHeader')).toEqual('customerHeaderValue');
  });
  it('set both custom header and apiClient, should prioritize apiClient and SDK headers if sent to internal endpoint', async () => {
    const requestOptions: RequestOptions = {
      customHeaders: new Headers({
        'User-Agent': 'user-agent-value',
        'X-Goog-Api-Client': 'apiClient1',
        'Content-Type': 'other-content-type',
      }),
      apiClient: 'apiClient2',
    } as RequestOptions;
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT,
      data: data,
      requestOptions: requestOptions,
    });
    const actualHeaders = fetchSpy.calls.mostRecent().args[1].headers;
    expect(actualHeaders.get('X-Goog-Api-Client')).toEqual(
      'apiClient1, apiClient2'
    );
    expect(actualHeaders.get('User-Agent')).toContain('model-builder');
    expect(actualHeaders.get('User-Agent')).toContain('user-agent-value');
    expect(actualHeaders.get('Content-Type')).toEqual('application/json');
  });

  it('set both custom header and apiClient, should prioritize custom headers if sent to external endpoint', async () => {
    const requestOptions: RequestOptions = {
      customHeaders: new Headers({
        'User-Agent': 'user-agent-value',
        'X-Goog-Api-Client': 'apiClient1',
        'Content-Type': 'other-content-type',
      }),
      apiClient: 'apiClient2',
    } as RequestOptions;
    await postRequest({
      region: REGION,
      project: PROJECT,
      resourcePath: RESOURCE_PATH,
      resourceMethod: RESOURCE_METHOD,
      token: TOKEN,
      apiEndpoint: API_ENDPOINT_EXTERNAL,
      data: data,
      requestOptions: requestOptions,
    });
    const actualHeaders = fetchSpy.calls.mostRecent().args[1].headers;
    expect(actualHeaders.get('X-Goog-Api-Client')).toEqual(
      'apiClient1, apiClient2'
    );
    expect(actualHeaders.get('User-Agent')).toContain('model-builder');
    expect(actualHeaders.get('User-Agent')).toContain('user-agent-value');
    expect(actualHeaders.get('Content-Type')).toEqual('other-content-type');
  });
});
