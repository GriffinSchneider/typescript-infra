import * as path from 'path';
import express from 'express';
import { Server } from 'typescript-rest';

export function startup(opts: { apiName: string }) {
  const app: express.Application = express();
  Server.buildServices(app);
  Server.swagger(app, {
    endpoint: 'api-docs',
    filePath: path.resolve(__dirname, `../../../../shared/build/api-specs/${opts.apiName}-spec/swagger.json`),
  });
  app.listen(3000, function() {
    console.log('Rest Server listening on port 3000!');
  });
}
