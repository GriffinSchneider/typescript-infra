import * as path from 'path';
import express from 'express';
import { Server } from 'typescript-rest';
import { LoggingType, log } from '@common/logging';

export function startup(opts: {
  apiName: string;
  somethingLogging?: LoggingType; // TODO: Test, remove
}): void {
  const app: express.Application = express();
  Server.buildServices(app);
  Server.swagger(app, {
    endpoint: 'api-docs',
    filePath: path.resolve(__dirname, `../../../../shared/build/api-specs/${opts.apiName}-spec/swagger.json`),
  });
  app.listen(3000, function() {
    log('Rest Server listening on port 3000!');
  });
}

export * from 'typescript-rest';
