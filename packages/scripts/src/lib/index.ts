import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface LernaPackage {
  name: string;
  location: string;
  packageJson: PackageJson;
  dependencies: LernaPackage[];
}

export interface PackageJson {
  dependencies?: {[key: string]: string};
  scripts?: {[key: string]: string};
}

function packageJsonForPackage(lernaPackage: LernaPackage): PackageJson {
  const packagePath = path.join(lernaPackage.location, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
}

function dependenciesForPackage(lernaPackage: LernaPackage, allPackages: LernaPackage[]): LernaPackage[] {
  return Object.keys(lernaPackage.packageJson.dependencies || {})
    .map(depName => allPackages.find(lernaPackage => lernaPackage.name === depName))
    .filter((lernaDep?: LernaPackage): lernaDep is LernaPackage => !!lernaDep);
}

export function getProjectPackages(): LernaPackage[] {
  const command = 'npx lerna ll --loglevel=silent --all --json'
  const parsed = JSON.parse(execSync(command, { encoding: 'utf8' })) as LernaPackage[];
  const withPackageJsons = parsed.map(p => ({
    ...p,
    packageJson: packageJsonForPackage(p),
  }));
  withPackageJsons.forEach(p => {
    p.dependencies = dependenciesForPackage(p, withPackageJsons);
  });
  return withPackageJsons;
}

export function getProjectApiPackages(): LernaPackage[] {
  const allPackages = getProjectPackages();
  return allPackages.filter(p => {
    const specFolder = path.join(p.location, 'spec');
    if (!fs.existsSync(specFolder)) { return false; }
    const withoutNamespace = p.name.match(/@.*?\/(.*)/);
    if (!withoutNamespace) { throw new Error(`Found package without a namespace: ${p.name}`); }
    const specFilename = `${withoutNamespace[1]}-spec.yaml`;
    if (!fs.existsSync(path.join(specFolder, specFilename))) {
      throw new Error(`Package ${p.name} has an spec/ folder but no ${specFilename} file.`);
    }
    return true;
  });
}


