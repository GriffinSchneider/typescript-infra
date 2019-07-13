#!/usr/bin/env node

import { getProjectApiPackages, LernaPackage } from "../lib";
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import mkdirp from 'mkdirp';

function outputFolder(pack: LernaPackage) {
  return path.join(pack.location, 'src', 'generated');
}

function stringForRouteFile(file: string, i: number) {
  // Import and then declare a variable so that, if a routes file exports something that isn't a route handling function,
  // it's clear which file is exporting the bad thing.
  return `import * as import${i} from '${file}';\nconst routes${i}: ((service: Service<Context>) => void)[] = Object.values(import${i});\n\n`;
}

function routeBarrelContents(pack: LernaPackage, routeFilenames: string[]): string {
  // Get the relative paths from our barrel file to the files we're importing, without the file extensions.
  const relativeRouteFilenames = routeFilenames.map(r => {
    const relative = path.relative(outputFolder(pack), r);
    const parsed = path.parse(relative);
    return path.join(parsed.dir, parsed.name);
  });
  const imports = relativeRouteFilenames.map(stringForRouteFile).join('');
  const beginning = '// Generated by scripts/generate-route-barrels.\n\n' +
    'import { Service } from "@griffins/rest-server";\n' +
    'import { Context } from "../context";\n\n';
  const exp = `export const routes = [${relativeRouteFilenames.map((r, i) => `...routes${i}`).join(', ')}];`;
  return beginning + imports + exp;
}

const apiPackages = getProjectApiPackages();
apiPackages.forEach(pack => {
  const g = path.join(pack.location, 'src', 'routes', '**', '*.ts');
  glob(g, (err, matches) => {
    if (err) { throw err;}
    const contents = routeBarrelContents(pack, matches);
    const folder = outputFolder(pack);
    mkdirp.sync(folder);
    fs.writeFileSync(path.join(outputFolder(pack), 'routes.ts'), contents);
  });
});