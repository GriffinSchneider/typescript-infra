import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ItemsAPI, {ItemsAPIResponse, Items} from './build/api-clients/items-api';
import { ReactNativeEventSource } from 'rest-api-support';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function App(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

function isFoo(f: any): f is ItemsAPIResponse<Items> {
  return true;
}

async function script() {
  const api = new ItemsAPI({
    fetch: fetch,
    EventSource: ReactNativeEventSource,
    baseUrl: "http://localhost:3000",
    async requestInterceptor(params): Promise<void> {
    },
    async responseInterceptor(res, params): Promise<void> {
    }
  })
  const res = await api.itemsItemIdGet({
    itemId: 'griffin',
  });
  if (isFoo(res)) {
    console.log(res.body.items)
  }
}

script();
