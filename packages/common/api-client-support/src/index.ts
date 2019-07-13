import { Json } from '@griffins/json';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
export { DateFromISOString } from 'io-ts-types/lib/Date/DateFromISOString';

export type HTTPMethod  = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
export type InputLocation = 'body' | 'path' | 'query' | 'header';

type FetchType = typeof fetch;
export interface Config {
  fetch: FetchType;
  baseUrl: string;
}

export interface ApiResponse<ResponseType> {
  readonly body?: ResponseType;
  readonly rawResponse: Response;
}

export class ApiErrorResponse extends Error {
  readonly body?: Json;
  readonly rawResponse: Response;
  constructor(body: Json | undefined, rawResponse: Response, ) {
    super();
    this.body = body;
    this.rawResponse = rawResponse;
  }
}

export class DecodeError implements Error {
  public name: 'DecodeError' = 'DecodeError';
  public message: string;
  public errors: t.Errors;
  public constructor(errors: t.Errors) {
    this.message = PathReporter.report(t.failures(errors)).join('\n');
    this.errors = errors;
  }
}

async function getBody(res: Response): Promise<Json | undefined> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase() || undefined;
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return undefined;
}

const getKeys = <T extends {}>(o: T): Array<keyof T> => <Array<keyof T>>Object.keys(o)

export class ApiClient {
  private readonly config: Config;
  public constructor(config: Config) {
    this.config = config;
  }

  public async baseReq<
    InputValueType,
    InputType extends Record<string, InputValueType>,
    ResponseType,
    InputCodecType extends t.Type<InputType>,
    ResponseCodecType extends t.Type<ResponseType>,
  >(
    method: HTTPMethod,
    path: string,
    inputLocations: Record<string, InputLocation>,
    inputCodec: InputCodecType,
    responseCodec: ResponseCodecType,
    input: InputType,
  ): Promise<ApiResponse<ResponseType>> {

    // { and } will get query-encoded by URL, so use : for path params instead.
    const expressifiedPath = path.replace(/{(.*?)}/g, ':$1');

    // Serialize inputs into request
    console.log(JSON.stringify(input));
    const encodedInput = inputCodec.encode(input);
    let serializedPath = expressifiedPath;
    const req: RequestInit = { headers: { } };
    getKeys(inputLocations).forEach(inputKey => {
      const inputLocation = inputLocations[inputKey];
      const inputValue = encodedInput[inputKey];
      if (inputLocation === 'query') {
        url.searchParams.append(`${inputKey}`, encodeURIComponent(`${inputValue}`));
      } else if (inputLocation === 'body') {
        req.body = JSON.stringify(inputValue);
      } else if (inputLocation === 'path') {
        serializedPath = serializedPath.replace(
          new RegExp(`:${inputKey}`, 'g'),
          _ => `${inputValue}`,
        );
      } else if (inputLocation === 'header') {
        (req.headers as Record<string, string>)[`${inputKey}`] = `${inputValue}`;
      }
    });
    const url = new URL(`${this.config.baseUrl}${serializedPath}`);

    // Make the request
    const res = await this.config.fetch(url.href, req);

    // Deserialize response
    const body = await getBody(res);
    if (res.status < 200 || res.status > 299) {
      throw new ApiErrorResponse(await getBody(res), res);
    }
    const decodedBody = body && responseCodec.decode(body).fold(
      errors => { throw new DecodeError(errors) },
      decodedValue => decodedValue,
    );
    return { body: decodedBody, rawResponse: res }
  }
}
