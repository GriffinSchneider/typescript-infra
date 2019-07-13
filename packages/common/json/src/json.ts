export type JsonPrimitive = boolean | number | string | null;
export interface JsonObject { [key: string]: AnyJson }
export type AnyJson = JsonPrimitive | JsonArray | JsonObject;
export interface JsonArray extends Array<AnyJson> {}

export class Json {
  public static parse(jsonString: string): AnyJson {
    // eslint-disable-next-line no-restricted-properties
    return JSON.parse(jsonString)
  }
  public static isObject(json: AnyJson): json is JsonObject {
    return json !== null && typeof json === 'object' && !(json instanceof Array);
  }
  public static isArray(json: AnyJson): json is JsonArray {
    return json instanceof Array;
  }
}
