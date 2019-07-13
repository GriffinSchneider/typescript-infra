import { registerRoute } from '../generated/server';
import { fetchItems } from '../lib/items';

export const get = registerRoute('GET /transactions/{accountId}', async (args, ctx) => {
  return fetchItems(args.accountId || '');
});

