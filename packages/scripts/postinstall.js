/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');

// We're using Yarn workspaces via package.json, but that hoists all dependencies (including @griffins/ depdendencies)
// into the top-level node_modules folder. The TypeScript compiler is perfectly happy with this setup, but
// WebStorm/VSCode seem unable to find the @griffins/ modules and start throwing errors. This lerna link command
// creates symlinks to all @griffins/ dependencies in each modules' local node_modules folder. The editors seem to like
// this much better.
execSync('npx lerna link --force-local', { stdio: 'inherit' });
