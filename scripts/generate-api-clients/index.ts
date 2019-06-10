import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as config from './codegen-config.json';

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
  const clientsDir = path.resolve(__dirname, config.output, '../');
  const clients = fs.readdirSync(clientsDir);
  for (const client of clients) {
    const fullPath = path.join(clientsDir, client);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      console.log(fullPath)
      await proc(fullPath, 'npm install');
      await proc(fullPath, 'npm run build');
    }
  }
})();
