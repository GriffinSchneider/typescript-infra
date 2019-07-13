#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

// @ts-ignore
import { render } from 'small-swagger-codegen';
import { execSync } from 'child_process';
import _ from 'lodash';
import yaml from 'js-yaml';
import minimist from 'minimist';
import * as path from 'path';
import * as fs from 'fs';

const argv = minimist(process.argv.slice(2));
const apiName = argv._[0];
if (!apiName) { throw new Error('Missing api name.'); }

console.log(`Beginning OpenAPI codegen for ${apiName}...`);

const commonTemplates = [{
  source: path.resolve(__dirname, 'modelTemplate.handlebars'),
  partial: 'modelTemplate',
}, {
  source: path.resolve(__dirname, 'routeInfoTemplate.handlebars'),
  partial: 'routeInfoTemplate',
}] as const;

const routeTemplates = [...commonTemplates, {
  source: path.resolve(__dirname, 'serverRouterTemplate.handlebars'),
  filename: () => 'router.ts',
}] as const;

const clientTemplates = [...commonTemplates, {
  source: path.resolve(__dirname, 'clientTemplate.handlebars'),
  filename: () => 'src/index.ts',
}, {
  source: path.resolve(__dirname, 'clientPackageTemplate.handlebars'),
  filename: () => 'package.json',
}, {
  source: path.resolve(__dirname, 'clientTsconfigTemplate.handlebars'),
  filename: () => 'tsconfig.json',
}] as const;

const typeMap = {
  any: 'any',
  undefined: 'void',
  boolean: 'boolean',
  number: 'number',
  file: 'string',
  object: (additionalType: string) => `Map<string, ${additionalType}>`,
  integer: 'number',
  string: { date: 'Date', 'date-time': 'Date', default: 'string' },
  array: (typeName: string) => `Array<${typeName}>`,
} as const;

function configureHandlebars(handlebars: any): void {
  const jsIdentifier = (ident: string) => new handlebars.SafeString(ident.replace(/[.]/g, '_'));
  handlebars.registerHelper('jsIdentifier', jsIdentifier);
  handlebars.registerHelper('maybeComment', function maybeComment(this: any, arg: unknown, options: any) {
    if (!arg) {
      return arg;
    }
    const data = options.data ? undefined : {
      data: handlebars.createFrame(options.data),
    };
    const string = options.fn ? options.fn(this, data) : '';
    if (!string || string.trim() === '') {
      return undefined;
    }
    const trimmed = string.trim().replace(/\n/g, ' ');
    const numSpaces = string.search(/\S/);
    return `${' '.repeat(numSpaces)}/// ${trimmed}\n`;
  });
  handlebars.registerHelper('tsCodecName', function codecName(ident: string): string {
    const ioTsMap: Record<string, string> = {
      any: 't.unknown',
      void: 't.void',
      boolean: 't.boolean',
      number: 't.number',
      string: 't.string',
      Date: 'DateFromISOString',
      'date-time': 'DateFromISOString',
    };
    if (ioTsMap[ident]) { return ioTsMap[ident]; }
    const arrayMatch = ident.match(/Array<(.*)>/);
    if (arrayMatch) { return `t.array(${codecName(arrayMatch[1])})`; }
    const objectMatch = ident.match(/Map<string, (.*)>/);
    if (objectMatch) { return `t.record(t.string, ${codecName(objectMatch[1])})`; }
    return `${ident}Codec`;
  });
  handlebars.registerHelper('eachRequiredProp', function eachRequiredProp(context: any, options: any) {
    if (!Array.isArray(context)) { throw new Error(`Expected array for eachRequiredProp but got ${context}`); }
    const filtered = _.filter(context, p => p.isRequired);
    return filtered.reduce((acc, p) => acc + options.fn(p), '');
  });
  handlebars.registerHelper('eachOptionalProp', function eachOptionalProp(context: any, options: any) {
    if (!Array.isArray(context)) { throw new Error(`Expected array for eachOptionalProp but got ${context}`); }
    const filtered = _.filter(context, p => !p.isRequired);
    return filtered.reduce((acc, p) => acc + options.fn(p), '');
  });
  handlebars.registerHelper('concat', (delim: any, ...args: any) => args.slice(0, args.length - 1).join(delim));
}

function generate(apiName: string, templates: any, options: any, output: string) {
  const typescriptServerLanguageSpec = { templates, typeMap, configureHandlebars };
  const specPath = path.resolve(__dirname, `../../../backend/${apiName}/spec/${apiName}-spec.yaml`);
  const specData = fs.readFileSync(specPath, 'utf8');
  const spec =  yaml.safeLoad(specData);
  const apis = { [apiName]: { basePath: '', spec } };
  const opts = { 'noOperationIds': true, ...options };
  render(typescriptServerLanguageSpec, apis, opts, output);
}

function generateRoutes(apiName: string) {
  const output = path.resolve(__dirname, `../../../backend/${apiName}/src/generated`);
  generate(apiName, routeTemplates, {}, output);
}

function generateClient(apiName: string) {
  const output = path.resolve(__dirname, `../../../common/generated/${apiName}-client`);
  generate(apiName, clientTemplates, { packageName: `@griffins/${apiName}-client`}, output);
}

generateRoutes(apiName);
generateClient(apiName);

console.log(`OpenAPI codegen for ${apiName} complete.`);
