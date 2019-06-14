// @ts-ignore

// TODO: Real watching, so that whenever @common/backend changes, all the services
// that depend on it get rebuilt and restarted.
// Build an api and its dependencies like this:
//   npx lerna run build --scope items-api --include-filtered-dependencies

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
