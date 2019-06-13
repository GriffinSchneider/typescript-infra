export interface Item {
  name: string;
  otherName: string;
  thirdName: string;
}

export interface Items {
  items: Item[];
  page: number;
}

export async function fetchItems(accountId: string): Promise<Items> {
  return {
    page: 0,
    items: [
      { name: `Hello ${accountId}`, otherName: 'griffin', thirdName: '3' }
    ]
  };
}
