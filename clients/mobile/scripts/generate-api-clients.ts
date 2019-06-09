import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function proc(cwd: string, cmd: string) {
  const {stdout, stderr} = await promisify(exec)(cmd, {
    cwd,
    encoding: 'utf8'
  });
  console.log(stdout)
  console.log(stderr)
}

async function script() {
  await proc('.', 'npx small-swagger-codegen codegenconfig.json');
  const clientDir = './build/api-clients';
  const clients = fs.readdirSync(clientDir);
  for (const client of clients) {
    const fullPath = path.join(clientDir, client);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      console.log(fullPath)
      await proc(fullPath, 'npm install');
      await proc(fullPath, 'npm run build');
    }
  }
}
script();
