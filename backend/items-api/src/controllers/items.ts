import { Path, GET, PathParam } from "@common/backend";
import { fetchItems, Items } from '../lib/items';

@Path("/items")
export default class ItemsController {
  @GET @Path(":accountId")
  public async getItems(@PathParam('accountId') accountId: string): Promise<Items> {
    return fetchItems(accountId)
  }
}
