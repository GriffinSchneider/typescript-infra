import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import console = require('console');

async function proc(cwd: string, cmd: string) {
  const {stdout, stderr} = await promisify(exec)(cmd, {
    cwd,
    encoding: 'utf8'
  });
  console.log(stdout);
  console.log(stderr);
}

(async () => {
  const configPath = path.resolve(__dirname, 'codegen-config.json');
  await proc('.', `npx small-swagger-codegen ${configPath}`);
  // TODO: Read package names from codegen config once it supports multiple package names.
  await proc('.', `yarn upgrade @common/items-api-client`);
})();
