import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import console = require('console');

async function proc(cwd: string, cmd: string) {
  const {stdout, stderr} = await promisify(exec)(cmd, {
    cwd,
    encoding: 'utf8'
  });
  stdout && stdout.trim() && console.log(stdout);
  stderr && stderr.trim() && console.log(stderr);
}

async function generateClient(name: string) {
  // Currently, these generated clients are expecting to be built with babel, so their package.json points where
  // the babel output will go. But, the non-babel-ed code actually works fine with TypeScript, so to save time we'll
  // just modify the package.jsons to point them at the non-babel-ed code.
  const packagePath = path.join(__dirname, '../../shared/build/api-clients', name, 'package.json');
  const packageString = fs.readFileSync(packagePath, { encoding: 'utf8' });
  const newPackage = { ...JSON.parse(packageString), main: 'index.js' };
  fs.writeFileSync(packagePath, JSON.stringify(newPackage, null, 2));

  await proc('clients/mobile', `yarn upgrade --silent @common/${name}-client`);
}

(async () => {
  const configPath = path.resolve(__dirname, 'codegen-config.json');
  await proc('.', `npx small-swagger-codegen ${configPath}`);
  // TODO: Read package names from codegen config once it supports multiple package names.
  await generateClient('items-api');
  console.log('API client generation complete.');
})();
