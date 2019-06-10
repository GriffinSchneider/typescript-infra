import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { get } from 'ts-get';
import ItemsAPI, {Items} from './build/api-clients/items-api';
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

const api = new ItemsAPI({
  fetch: fetch,
  EventSource: ReactNativeEventSource,
  baseUrl: "http://localhost:3000",
});

async function getItems() {
  const res = await api.itemsAccountIdGet({ accountId: 'griffin' });
  if (res.type === 'error') {
    return undefined;
  }
  console.log(`Got Items: ${JSON.stringify(get(res, it => it.body), null, 2)}`);
  return res.body;
}

export default class App extends React.Component<void, {
  items?: Items;
}> {
  public constructor() {
    super();
    this.state = {}
  }
  public render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <Text>{JSON.stringify(get(this.state, it => it.items.items), null, 2)}</Text>
      </View>
    );
  }
  public async componentDidMount() {
    this.setState({ items: await getItems() });
  }
}
