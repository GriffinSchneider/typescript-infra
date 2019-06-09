import express from 'express';
import {Server, Path, GET, PathParam} from "typescript-rest";

interface Item {
  name: string;
  otherName: string;
  thirdName: string;
}
interface Items {
  items: Array<Item>;
}

@Path("/items")
export class ItemsController {
  @Path(":itemId")
  @GET
  async getItems( @PathParam('itemId') id: string ): Promise<Items> {
    return { items: [{ name: `Hello ${id}`, otherName: 'griffin', thirdName: '3' }] };
  }
}

let app: express.Application = express();
Server.buildServices(app);
app.listen(3000, function() {
  console.log('Rest Server listening on port 3000!');
});
