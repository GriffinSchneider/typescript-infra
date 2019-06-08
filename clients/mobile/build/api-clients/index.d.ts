// tslint:disable
interface ItemsAPIPromise<T> extends Promise<T>{
  abort();
  /**
   * Expect certain status codes and accept the promise rather than
   * throwing
   */
  expect(...statusCodes) : ItemsAPIPromise<T>;
}

interface EventSource {
  constructor(url: string, init?: any);
  removeAllListeners();
  addEventListener(name: string, handler: (data: any) => void);
  close();
}

interface ItemsAPIResponseHeaders {
  get(header: string) : any;
}

interface ItemsAPIResponse<T> {
  body: T;
  status: number;
  headers: ItemsAPIResponseHeaders,
}

interface ItemsAPIErrorResponse {
  code: string;
  message: string;
  domain: string;
  display_message?: string;
}

interface ItemsAPIRequestOptions {
  /**
   * Run before the request goes out with the parameters that will be used
   */
  requestInterceptor: (parameters: any) => void;
  /**
   * Run after the request comes back
   */
  responseInterceptor: (response: any, parameters: any) => void;
}

export class ItemsAPIConfiguration {
  /**
   * Will be prepended to the path defined in the Swagger spec
   */
  baseUrl?: string;

  /**
   * For streaming requests
   */
  EventSource: (url: string, init?: any) => EventSource;

  /**
   * For non-streaming requests
   */
  fetch: (url: string, init?: any) => Promise<Response>;

  /**
   * Run before the request goes out with the parameters that will be used
   */
  requestInterceptor: (parameters: any) => void;

  /**
   * Run after the request comes back
   */
  responseInterceptor: (response: any, parameters: any) => void;
}

/**
 * @export
 * @class Items
 */
export interface Items {
  items: Array<Item>;
}

/**
 * @export
 * @class Item
 */
export interface Item {
  name: string;
  otherName: string;
  thirdName: string;
}


export interface getItemsArguments {
  id: number,
  name: string,
}

export default class ItemsAPI {
  constructor(configOrFunctionGeneratingConfig: ItemsAPIConfiguration);

  /**
   * 
   *
   * @parameter { number } id: 
   * @parameter { string } name: 
   */
  getItems(request: getItemsArguments, options?: ItemsAPIRequestOptions) : ItemsAPIPromise<ItemsAPIResponse<Items> | ItemsAPIErrorResponse | null>;
}
