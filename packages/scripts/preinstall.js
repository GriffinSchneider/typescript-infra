/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generatePlaceholder(name, dir) {
  const packagePath = path.join(dir, 'package.json');
  if (fs.existsSync(packagePath)) { return; }
  execSync(`mkdir -p "${dir}"`, { stdio: 'inherit' });
  fs.writeFileSync(packagePath, JSON.stringify({
    name,
    version: '1.0.0',
    dependencies: { 'rest-api-support':'^1.0.1' },
    devDependencies: { '@babel/cli': '^7.4.3', 'babel-preset-gasbuddy': '^5.3.2' },
  }), 'utf8');
}
// Workaround: Some of our packages are generated and not committed to git. They're referenced in our package.jsons
// though, which means we can't `yarn install` until they're generated, but we can't generate them until we
// `yarn install`. So, we'll make placeholder package.jsons for all generated packages, then `yarn install` will work
// and then we can generate them for real.
// TODO: Don't hardcode client names
generatePlaceholder('@griffins/items-api-client', 'packages/common/build/api-clients/items-api');
