import { startup } from '@griffins/backend';

// Import all controllers so their decorators get processed by typescript-rest.
import './controllers/barrel';
startup({ apiName: 'items-api' });
