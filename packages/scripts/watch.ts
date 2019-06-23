import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore
import concurrently from 'concurrently';
import { get } from 'ts-get';

interface ConcurrentlyCommand {
  command: string;
  name: string;
  prefixColor: string;
}
interface LernaPackage {
  name: string;
  location: string;
  packageJson: PackageJson;
}
interface PackageJson {
  dependencies?: {[key: string]: string};
  scripts?: {[key: string]: string};
}

function packageJsonForPackage(lernaPackage: LernaPackage): PackageJson {
  const packagePath = path.join(lernaPackage.location, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
}

function parsedLerna(command: string, cwd?: string) {
  const parsed = JSON.parse(execSync(command, { cwd, encoding: 'utf8' })) as LernaPackage[];
  return parsed.map(p => ({
    ...p,
    packageJson: packageJsonForPackage(p),
  }));
}

const lernaPackageList = parsedLerna('npx lerna ll --loglevel=silent --all --json') ;

// Nodemon can't watch a directory if the directory doesn't exist yet, and we need to watch all the build/ directories,
// so ensure they exist ahead of time.
lernaPackageList.forEach(lernaPackage => {
  const buildPath = path.join(lernaPackage.location, 'build');
  if (fs.existsSync(buildPath)) { return; }
  execSync(`mkdir -p "${buildPath}"`, { stdio: 'inherit' });
});

function dependenciesForPackage(lernaPackage: LernaPackage): LernaPackage[] {
  return Object.keys(lernaPackage.packageJson.dependencies || {})
    .map(depName => lernaPackageList.find(lernaPackage => lernaPackage.name === depName))
    .filter((lernaDep?: LernaPackage): lernaDep is LernaPackage => !!lernaDep);
}

// Construct a command that will watch for changes to this package's source or any of this package's dependencies' build
// outputs and re-build this package.
// When this is run for the first time after a fresh clone, the package's dependencies may not have been built yet.
// So, if this package's deps haven't been built, then don't do anything. The file watcher should invoke our command
// again once the deps have built.
function buildCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand {
  const dependencies = dependenciesForPackage(lernaPackage);
  const dependencyWatchPaths = dependencies.map(d => path.join(d.location, 'build'));
  const watchPart = dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
  const dependencyIfs = dependencyWatchPaths.map(p => `[ -z "$(find ${p} -prune -empty)" ] && `).join('');
  const buildPart = `${dependencyIfs}npm run --silent build || echo 'Waiting until all dependencies of ${lernaPackage.name} are built...'`;
  const nodemonPart = `npx nodemon -q --ext ts --ignore barrel.ts -x '${buildPart}' --watch src/`;
  const cdPart = `cd "${lernaPackage.location}"`;
  return {
    command: `${cdPart} && ${nodemonPart} ${watchPart}`,
    name: `build ${lernaPackage.name}`,
    prefixColor: 'blue',
  };
}

// If this package has a `start` script, construct a command that will watch for changes to this package's build
// output and start it if it's been built.
function runCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand | undefined {
  const start = get(lernaPackage, it => it.packageJson.scripts['start']);
  if (!start) { return undefined; }
  const dependencies = dependenciesForPackage(lernaPackage);
  const dependencyWatchPaths = dependencies.map(d => path.join(d.location, 'build'));
  const watchPart = dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
  const runPart = `[ -z "$(find build -prune -empty)" ] && npm run --silent start || echo "Waiting until ${lernaPackage.name} is built..."`;
  const nodemon = `npx nodemon -q -x '${runPart}' --watch build/`;
  const cd = `cd "${lernaPackage.location}"`;
  return {
    command: `${cd} && ${nodemon} ${watchPart}`,
    name: `run ${lernaPackage.name}`,
    prefixColor: 'green',
  }
}

function generateApiClientsCommand(): ConcurrentlyCommand {
  const configDir = path.join(__dirname, 'generate-api-clients');
  const codegenConfig = JSON.parse(fs.readFileSync(path.join(configDir, 'codegen-config.json'), { encoding: 'utf8' }));
  const specPaths = Object.entries(codegenConfig.specs).map(([, config]) => (
    path.join(configDir, (config as {spec: string}).spec)
  ));
  const specIfs = specPaths.map(specPath => `[ -e "${specPath}" ] && `).join('');
  const watchDir = './packages/common/build/api-specs';
  return {
    command: `mkdir -p ${watchDir} && nodemon -q -x '${specIfs}npm run --silent generate-api-clients || echo "Waiting for all specs to exist..."' --ext json --watch '${watchDir}'`,
    name: 'gen-api-clients',
    prefixColor: 'magenta',
  };
}

const commands = [
  generateApiClientsCommand(),
  ...lernaPackageList.map(buildCommandForPackage),
  ...lernaPackageList.map(runCommandForPackage).filter((c): c is ConcurrentlyCommand => !!c),
];
concurrently(commands);
