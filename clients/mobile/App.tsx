import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ItemsAPI, {ItemsAPIResponse, Items} from './build/api-clients/items-api';
// @ts-ignore
import { ReactNativeEventSource } from 'rest-api-support';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function isFoo(f: any): f is ItemsAPIResponse<Items> {
  return true;
}

async function getItems(): Promise<Items | undefined> {
  const api = new ItemsAPI({
    fetch: fetch,
    EventSource: ReactNativeEventSource,
    baseUrl: "http://localhost:3000",
    async requestInterceptor(params): Promise<void> {
    },
    async responseInterceptor(res, params): Promise<void> {
    }
  });
  const res = await api.itemsAccountIdGet({
    accountId: 'griffin',
  });
  if (isFoo(res)) {
    console.log(`Got Items: ${JSON.stringify(res.body, null, 2)}`);
    return res.body;
  }
  return undefined;
}

interface State {
  items?: Items;
}

export default class App extends React.Component<void, State> {
  public constructor() {
    super();
    this.state = {}
  }
  public render(): JSX.Element {
    return (
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <Text>{JSON.stringify(this.state.items, null, 2)}</Text>
      </View>
    );
  }
  public async componentDidMount(): Promise<void> {
    this.setState({ items: await getItems() });
  }
}
