import { registerRoute } from '../generated/server';
import { fetchItems } from '../lib/items';

export const get = registerRoute('GET /items/{accountId}', async (args, ctx) => {
  ctx.logger.debug(`Getting items for account ${args.accountId}`);
  return fetchItems(args.accountId || '');
});
