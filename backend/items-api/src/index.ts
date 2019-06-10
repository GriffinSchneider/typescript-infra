import * as path from 'path';
import express from 'express';
import { Server } from 'typescript-rest';

// Import all controllers so their decorators get processed by typescript-rest.
import './controllers/barrel';

const app: express.Application = express();
Server.buildServices(app);
Server.swagger(app, {
  endpoint: 'api-docs',
  filePath: path.resolve(__dirname, '../../../shared/build/items-api-spec/swagger.json'),
});
app.listen(3000, function() {
  console.log('Rest Server listening on port 3000!');
});
