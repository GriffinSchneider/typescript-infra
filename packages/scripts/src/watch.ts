import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore
import concurrently from 'concurrently';
import { get } from 'ts-get';
import { LernaPackage, getProjectPackages } from "./lib";

interface ConcurrentlyCommand {
  command: string;
  name: string;
  prefixColor: string;
}

function isMobile(pack: LernaPackage): boolean {
  return pack.name === '@griffins/mobile';
}

const allPackages = getProjectPackages();

// Nodemon can't watch a directory if the directory doesn't exist yet, and we need to watch all the build/ directories,
// so ensure they exist ahead of time.
allPackages.forEach(pack => {
  const buildPath = path.join(pack.location, 'build');
  if (fs.existsSync(buildPath)) { return; }
  execSync(`mkdir -p "${buildPath}"`, { stdio: 'inherit' });
});

// Construct a command that will watch for changes to this package's source or any of this package's dependencies' build
// outputs and re-build this package.
// When this is run for the first time after a fresh clone, the package's dependencies may not have been built yet.
// So, if this package's deps haven't been built, then don't do anything. The file watcher should invoke our command
// again once the deps have built.
function buildCommandForPackage(pack: LernaPackage): ConcurrentlyCommand | undefined {
  if (isMobile(pack)) { return undefined; }
  const dependencyWatchPaths = pack.dependencies.map(d => path.join(d.location, 'build'));
  const watchPart = dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
  const dependencyIfs = dependencyWatchPaths.map(p => `[ -z "$(find ${p} -prune -empty)" ] && `).join('');
  const buildPart = `${dependencyIfs}npm run --silent build || echo 'Waiting until all dependencies of ${pack.name} are built...'`;
  const nodemonPart = `npx nodemon -q --ext ts,yaml,handlebars --ignore routes.ts --ignore server.ts -x '${buildPart}' --watch src/ --watch spec/`;
  const cdPart = `cd "${pack.location}"`;
  return {
    command: `${cdPart} && ${nodemonPart} ${watchPart}`,
    name: `build ${pack.name}`,
    prefixColor: 'blue',
  };
}

// If this package has a `start` script, construct a command that will watch for changes to this package's build
// output and start it if it's been built.
function runCommandForPackage(pack: LernaPackage): ConcurrentlyCommand | undefined {
  if (isMobile(pack)) { return undefined; }
  const start = get(pack, it => it.packageJson.scripts['start']);
  if (!start) { return undefined; }
  const dependencyWatchPaths = pack.dependencies.map(d => path.join(d.location, 'build'));
  const watchPart = dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
  const runPart = `[ -z "$(find build -prune -empty)" ] && npm run --silent start || echo "Waiting until ${pack.name} is built..."`;
  const nodemon = `npx nodemon -q -x '${runPart}' --watch build/`;
  const cd = `cd "${pack.location}"`;
  return {
    command: `${cd} && ${nodemon} ${watchPart}`,
    name: `run ${pack.name}`,
    prefixColor: 'green',
  }
}

function injectMobileNodeModulesCommand(): ConcurrentlyCommand {
  const buildPaths = allPackages.filter(p => !isMobile(p)).map(p => path.join(p.location, 'build'));
  const watchPart = buildPaths.map(p => `--watch ${p}`).join(' ');
  return {
    command: `npx nodemon -q -x 'npm run --silent inject-mobile-node-modules' --watch node_modules ${watchPart}`,
    name: 'inject mobile deps',
    prefixColor: 'grey',
  };
}

const commands = [
  ...allPackages.map(buildCommandForPackage).filter((c): c is ConcurrentlyCommand => !!c),
  ...allPackages.map(runCommandForPackage).filter((c): c is ConcurrentlyCommand => !!c),
  injectMobileNodeModulesCommand(),
];

concurrently(commands);
