// eslint-disable camelcase
// eslint-disable-next-line no-unused-vars
import { parameterBuilder, fetchHelper, eventSourceHelper } from 'rest-api-support';

const CONFIG_FUNCTION = Symbol.for('small-swagger-codegen::configurationGenerator');

/**
 *
 * @export
 * @class ItemsAPI
 */
export default class ItemsAPI {
  constructor(configOrGenerator) {
    let config = (configOrGenerator && configOrGenerator[CONFIG_FUNCTION]) || configOrGenerator;
    if (typeof config === 'function') {
      config = config(ItemsAPI);
    }
    const {
      baseUrl = '',
      fetch,
      EventSource,
      requestInterceptor,
      responseInterceptor,
    } = config || {}
    Object.assign(this, { baseUrl, fetch, requestInterceptor, responseInterceptor, EventSource });
  }

  /**
   * getItems
   *
   * @parameter { number } id: 
   * @parameter { string } name: 
   */
  getItems({
    id,
    name,
  }, $$fetchOptions) {
    // Build parameters, run request interceptors, fetch, and then run response interceptors
    // eslint-disable-next-line prefer-rest-params
    const $$source = { method: 'getItems', client: '', arguments: arguments[0] };
    const $$fetchArgs = parameterBuilder('GET', this.baseUrl, '/Items/{id}')
      .path('id', id)
      .query('name', name)
      .build();
    return fetchHelper(this, $$fetchArgs, $$fetchOptions, $$source);
  }
}
