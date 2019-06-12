// @ts-ignore
import concurrently from 'concurrently';
concurrently([{
  command: 'npm run --silent watch-api-clients',
  name: 'gen-api-clients',
  prefixColor: 'magenta',
}, {
  command: 'cd backend/common && npm run --silent watch',
  name: '@common/backend',
  prefixColor: 'blue',
}, {
  command: 'cd backend/items-api && npm run --silent watch',
  name: 'items-api',
  prefixColor: 'green',
}]);
