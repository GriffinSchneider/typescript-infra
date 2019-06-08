import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ItemsAPI, {ItemsAPIResponse, Items} from './build/api-clients';
import { ReactNativeEventSource } from 'rest-api-support';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

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
    async requestInterceptor(params) {
      console.log(`Request`, params);
    },
    async responseInterceptor(res, params) {
      console.log(`Response`, res, params);

    }
  }
)

function isFoo(f: any): f is ItemsAPIResponse<Items> {
  return true;
}

console.log(api)
api.getItems({
  id: 43, name: 'griffin'
}).then(it => {
  if (isFoo(it)) {
    console.log(it.body.items)
  }
})
