import { Items } from "../generated/server";

export async function fetchItems(accountId: string): Promise<Items> {
  return {
    page: 0,
    items: [
      { name: `Hello ${accountId}`, otherName: 'griffin', thirdName: '3' }
    ]
  };
}
