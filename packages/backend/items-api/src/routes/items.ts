import { Router } from '../generated/router';
import { fetchItems } from '../lib/items';

export const router = new Router();

router.registerRoute('GET /items/{accountId}', async (args, ctx) => {
  ctx.logger.debug(`Getting items for account ${args.accountId}`);
  return fetchItems(args.accountId || '');
});
