import { Router } from '../generated/router';
import { fetchItems } from '../lib/items';

export const router = new Router();

router.registerRoute('GET /transactions/{accountId}', async (args, ctx) => {
  ctx.logger.debug('some log.');
  return fetchItems(args.accountId || '');
});
