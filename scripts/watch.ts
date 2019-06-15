// Concurrently run a bunch of nodemon commands
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

const lernaPackageList: LernaPackage[] = JSON.parse(
  execSync('npx lerna ll --all --json', { encoding: 'utf8' })
);
const lernaPackageMap = new Map<string, LernaPackage>();
lernaPackageList.forEach(p => {
  p.packageJson = packageJsonForPackage(p);
  lernaPackageMap.set(p.name, p);
});

function dependenciesForPackage(lernaPackage: LernaPackage): LernaPackage[] {
  const dependencies: string[] = Object.keys(lernaPackage.packageJson.dependencies || {});
  return Array.from(dependencies)
    .map(d => lernaPackageMap.get(d))
    .filter((p): p is LernaPackage => !!p)
    .filter(p => p !== lernaPackage);
}

function buildCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand {
  const dependencies = dependenciesForPackage(lernaPackage);
  const dependencyWatchPaths = dependencies.map(d => path.join(d.location, 'build'));
  const dependencyWatchCommand = dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
  const nodemon = 'npx nodemon -q --ext ts --ignore barrel.ts -x "npm run --silent build" --watch src/';
  const cd = `cd "${lernaPackage.location}"`;
  return {
    command: `${cd} && ${nodemon} ${dependencyWatchCommand}`,
    name: `build ${lernaPackage.name}`,
    prefixColor: 'blue',
  };
}

function runCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand | undefined {
  const startWatch = get(lernaPackage, it => it.packageJson.scripts['start-watch']);
  if (!startWatch) { return undefined; }
  const cd = `cd "${lernaPackage.location}"`;
  return {
    command: `${cd} && npm run --silent start-watch`,
    name: `run ${lernaPackage.name}`,
    prefixColor: 'green',
  }
}

const commands = [
  {
    command: 'npm run --silent watch-api-clients',
    name: 'gen-api-clients',
    prefixColor: 'magenta',
  },
  ...lernaPackageList.map(buildCommandForPackage),
  ...lernaPackageList.map(runCommandForPackage).filter((c): c is ConcurrentlyCommand => !!c),
];
concurrently(commands);
