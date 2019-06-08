import {Get, Post, Route, Body, Query, Header, Path, SuccessResponse, Controller } from 'tsoa';

interface Item {
  name: string;
  otherName: string;
  thirdName: string;
}
interface Items {
  items: Array<Item>;
}

@Route('Items')
export class UsersController extends Controller {
    @Get('{id}')
    public async getItems(id: number, @Query() name: string): Promise<Items> {
        return {items: [{ name, otherName: 'bob', thirdName: 'joe' }] };
    }
}
