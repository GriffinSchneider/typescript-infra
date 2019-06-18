import { Path, GET, PathParam } from '@griffins/backend';
import { fetchItems, Items } from '../lib/items';

@Path("/items")
export class ItemsController {
  @GET @Path(":accountId")
  public async getItems(@PathParam('accountId') accountId: string): Promise<Items> {
    return fetchItems(accountId)
  }
}
