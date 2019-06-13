import { Path, GET, PathParam } from "@common/backend";
import { fetchItems, Items } from '../lib/items';

@Path("/transactions")
export default class TransactionsController {
  @GET @Path(":accountId")
  public async getTransactions(@PathParam('accountId') accountId: string): Promise<Items> {
    return fetchItems(accountId)
  }
}
