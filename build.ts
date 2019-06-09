import { promisify } from 'util';
import { exec } from 'child_process';

async function proc(cwd: string, cmd: string) {
    const {stdout, stderr} = await promisify(exec)(cmd, {
        cwd,
        encoding: 'utf8'
    });
  console.log(stdout)
  console.log(stderr)
}

async function script() {
  await proc('./backend/items-api', 'npm run generate-spec');
  await proc('./clients/mobile', 'npm run generate-api-clients');
  await proc('./clients/mobile/build/api-clients/items-api', 'npm install && npm run build');
}
script();
