const { promisify } = require('util');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function proc(cwd, cmd) {
  const {stdout, stderr} = await promisify(exec)(cmd, {
    cwd,
    encoding: 'utf8'
  });
  console.log(stdout);
  console.log(stderr);
}

async function generatePlaceholder(name, dir) {
  await proc('.', `mkdir -p "${dir}"`);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name,
    version: '1.0.0'
  }), 'utf8');
}

async function script() {
  // Workaround: Some of our packages are generated and not committed to git. They're referenced in our package.jsons
  // though, which means we can't `yarn install` until they're generated, but we can't generate them until we
  // `yarn install`. So, we'll make placeholder package.jsons for all generated packages, then `yarn install` will work
  // and then we can generate them for real.
  console.log('Generating placeholders...');
  // TODO: Don't hardcode client names
  await generatePlaceholder('@common/items-api-client', 'shared/build/api-clients/items-api');
  await proc('.', 'yarn install');

  console.log('Generating backend specs...');
  await proc('.', 'npx lerna run generate-spec');
  console.log('Generating api clients...');
  await proc('.', 'npm run generate-api-clients');

  // Now we have to `yarn install` again to pick up any dependencies of the api clients we just generated.
  await proc('.', 'yarn install');

  // We're using Yarn workspaces via package.json, but that hoists all dependencies (including @common/ depdendencies)
  // into the top-level node_modules folder. The TypeScript compiler is perfectly happy with this setup, but
  // WebStorm/VSCode seem unable to find the @common/ modules and start throwing errors. This lerna link command
  // creates symlinks to all @common/ dependencies in each modules' local node_modules folder. The editors seem to like
  // this much better.
  await proc('.', 'npx lerna link --force-local');
}
script();
