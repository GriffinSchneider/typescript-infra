# typescript-infra
Playing with a full-stack typescript monorepo

## Setup
Assuming you have nodejs and yarn installed, starting in the root of this repo:
```sh
yarn install
yarn run watch
```
Now all the backend services are running, and there are various file watchers that should rebuild everything whenever a file changes. Swagger specs are automatically generated into packages/common/build/api-specs, and JS/TypeScript clients to call the APIs are automatically generated into packages/common/build/api-clients.


If you want to run the mobile app, do this in a second terminal:
```
cd packages/mobile
yarn install
yarn run start
```
Now you should be running a React Native app that makes a call to `items-api`. Changes to any of the code will automatically be reflected in what's running.
