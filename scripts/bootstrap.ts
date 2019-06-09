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
  console.log('Generating backend specs...')
  await proc('./backend/items-api', 'npm run generate-spec');

  console.log('Generating mobile api clients...')
  await proc('./clients/mobile', 'npm run generate-api-clients');
}
script();
