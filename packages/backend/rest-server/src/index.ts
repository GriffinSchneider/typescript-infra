import * as t from 'io-ts';
import _ from 'lodash';
import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');
import { PathReporter } from 'io-ts/lib/PathReporter';
import { Context } from './context';
export * from  './context';

export class DecodeError implements Error {
  public name: 'DecodeError' = 'DecodeError';
  public message: string;
  public errors: t.Errors;
  public constructor(errors: t.Errors) {
    this.message = PathReporter.report(t.failures(errors)).join('\n');
    this.errors = errors;
  }
}

function getValueOrThrow<T, V extends t.Validation<T>>(v: V): T {
  return v.fold(
    errors => { throw new DecodeError(errors); },
    decodedValue => decodedValue,
  );
}

function getInput(req: express.Request, inputLocation: InputLocation, paramName: string): unknown {
  if (inputLocation === 'body') { return req.body; }
  if (inputLocation === 'path') { return req.params[paramName]; }
  return req[inputLocation][paramName];
}

function parseInput<I, C extends t.Type<I>>(req: express.Request, inputLocations: Record<string, InputLocation>, inputCodec: C): I {
  const inputObj: Record<string, unknown> = {};
  _.toPairs(inputLocations).forEach(([paramName, inputLocation]) => {
    inputObj[paramName] = getInput(req, inputLocation, paramName);
  });
  return getValueOrThrow(inputCodec.decode(inputObj));
}

// Throw an exception if we try to register multiple handlers on one route (path + method).
type RouteRegistrations = Record<string, Record<string, boolean>>;
function recordRouteRegistration(method: string, path: string, registrations: RouteRegistrations) {
  const registeredForPath = registrations[path];
  const registeredForPathAndMethod = registeredForPath && registeredForPath[method];
  if (registeredForPathAndMethod) {
    throw new Error(`Attempting to register multiple handlers for the same route: ${method} ${path}`);
  }
  registrations[path] = registrations[path] || {};
  registrations[path][method] = true;
}

export type HTTPMethod  = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
export type InputLocation = 'body' | 'path' | 'query' | 'header';

export class Router<ContextType extends Context> {
  protected routes: ((service: Service<ContextType>) => void)[] = [];
  public apply(service: Service<ContextType>): void {
    this.routes.forEach(r => r(service));
  }
}

export class Service<ContextType extends Context> {
  private routeRegistrations: Record<string, Record<string, boolean>> = {};
  private app = express()
    .use(morgan('dev'))
    .use(bodyParser.json());

  private readonly ctx: ContextType;

  public constructor(ctx: ContextType) {
    this.ctx = ctx;
  }

  public registerRoute<
    InputType,
    ResponseType,
    InputCodecType extends t.Type<InputType>,
    ResponseCodecType extends t.Type<ResponseType>,
  >(
    method: HTTPMethod,
    path: string,
    inputLocations: Record<string, InputLocation>,
    inputCodec: InputCodecType,
    responseCodec: ResponseCodecType,
    handler: (args: InputType, ctx: ContextType) => Promise<ResponseType>,
  ): void {
    recordRouteRegistration(method, path, this.routeRegistrations);
    const expressifiedPath = path.replace(/{(.*?)}/g, ':$1');
    this.app[method](expressifiedPath, async (req, res) => {
      const input = parseInput<InputType, InputCodecType>(req, inputLocations, inputCodec);
      const output = await handler(input, this.ctx);
      res.send(responseCodec.encode(output));
    });
  }

  public startup() {
    this.app.listen(3000, function() {
      console.log('listening on port 3000!');
    });
  }
}
