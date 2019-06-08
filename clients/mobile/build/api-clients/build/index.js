"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _restApiSupport = require("rest-api-support");

// eslint-disable camelcase
// eslint-disable-next-line no-unused-vars
const CONFIG_FUNCTION = Symbol.for('small-swagger-codegen::configurationGenerator');
/**
 *
 * @export
 * @class ItemsAPI
 */

class ItemsAPI {
  constructor(configOrGenerator) {
    let config = configOrGenerator && configOrGenerator[CONFIG_FUNCTION] || configOrGenerator;

    if (typeof config === 'function') {
      config = config(ItemsAPI);
    }

    const {
      baseUrl = '',
      fetch,
      EventSource,
      requestInterceptor,
      responseInterceptor
    } = config || {};
    Object.assign(this, {
      baseUrl,
      fetch,
      requestInterceptor,
      responseInterceptor,
      EventSource
    });
  }
  /**
   * getItems
   *
   * @parameter { number } id: 
   * @parameter { string } name: 
   */


  getItems({
    id,
    name
  }, $$fetchOptions) {
    // Build parameters, run request interceptors, fetch, and then run response interceptors
    // eslint-disable-next-line prefer-rest-params
    const $$source = {
      method: 'getItems',
      client: '',
      arguments: arguments[0]
    };
    const $$fetchArgs = (0, _restApiSupport.parameterBuilder)('GET', this.baseUrl, '/Items/{id}').path('id', id).query('name', name).build();
    return (0, _restApiSupport.fetchHelper)(this, $$fetchArgs, $$fetchOptions, $$source);
  }

}

exports.default = ItemsAPI;