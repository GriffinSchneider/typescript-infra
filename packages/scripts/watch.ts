import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore
import concurrently from 'concurrently';
import { get } from 'ts-get';
import { Json } from '@griffins/json';

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

function packageJsonForPackage(lernaPackage: LernaPackage) {
  const packagePath = path.join(lernaPackage.location, 'package.json');
  const parsed = Json.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
  if (Json.isObject(parsed)) {
    return parsed;
  }
  throw new Error()
}

function parsedLerna(command: string, cwd?: string) {
  const parsed = Json.parse(execSync(command, { cwd, encoding: 'utf8' }));
  if (!Json.isArray(parsed)) { throw new Error(`Invalid Lerna data: ${parsed}`); }
  const retVal = parsed as unknown as LernaPackage[];
  return retVal.map(p => ({
    ...p,
    packageJson: packageJsonForPackage(p),
  }));
}

const lernaPackageList = parsedLerna('npx lerna ll --loglevel=silent --all --json') ;

function dependenciesForPackage(lernaPackage: LernaPackage): LernaPackage[] {
  const depsAndSelf = parsedLerna(`npx lerna ll --loglevel=silent --all --json --scope ${lernaPackage.name} --include-filtered-dependencies`);
  return depsAndSelf.filter(p => p.name !== lernaPackage.name);
}

function dependencyWatchCommandPartForPackage(lernaPackage: LernaPackage): string {
  const dependencies = dependenciesForPackage(lernaPackage);
  const dependencyWatchPaths = dependencies.map(d => path.join(d.location, 'build'));
  return dependencyWatchPaths.map(p => `--watch "${p}"`).join(' ');
}

function buildCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand {
  const watchPart = dependencyWatchCommandPartForPackage(lernaPackage);
  const nodemon = 'npx nodemon -q --ext ts --ignore barrel.ts -x "npm run --silent build" --watch src/';
  const cd = `cd "${lernaPackage.location}"`;
  return {
    command: `${cd} && ${nodemon} ${watchPart}`,
    name: `build ${lernaPackage.name}`,
    prefixColor: 'blue',
  };
}

function runCommandForPackage(lernaPackage: LernaPackage): ConcurrentlyCommand | undefined {
  const start = get(lernaPackage, it => it.packageJson.scripts['start']);
  if (!start) { return undefined; }
  const watchPart = dependencyWatchCommandPartForPackage(lernaPackage);
  const nodemon = 'npx nodemon -q -x "npm run --silent start" --watch build/';
  const cd = `cd "${lernaPackage.location}"`;
  return {
    command: `${cd} && ${nodemon} ${watchPart}`,
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
console.log(commands);
concurrently(commands);
