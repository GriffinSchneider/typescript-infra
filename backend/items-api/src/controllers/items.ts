import { Path, GET, PathParam } from "typescript-rest";
import { fetchItems, Items } from '../lib/items';

@Path("/items")
export default class ItemsController {
  @GET @Path(":accountId")
  async getItems(@PathParam('accountId') accountId: string): Promise<Items> {
    return fetchItems(accountId)
  }
}
