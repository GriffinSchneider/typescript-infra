export interface Item {
  name: string;
  otherName: string;
  thirdName: string;
}

export interface Items {
  items: Array<Item>;
}

export async function fetchItems(accountId: string): Promise<Items> {
    return {
        items: [
            { name: `Hello ${accountId}`, otherName: 'griffin', thirdName: '3' }
        ]
     };
}
