import { Path, GET, PathParam } from "typescript-rest";
import { fetchItems, Items } from '../lib/items';

@Path("/transactions")
export default class TransactionsController {
  @GET @Path(":accountId")
  async getTransactions(@PathParam('accountId') accountId: string): Promise<Items> {
    return fetchItems(accountId)
  }
}