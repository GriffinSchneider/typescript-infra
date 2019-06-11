# typescript-infra
Playing with a full-stack typescript monorepo

## Setup
Assuming you have nodejs and yarn installed, starting in the root of this repo:
```
yarn install
cd backend/items-api
npm run watch
```
Now `items-api` is running, and when a file is changed it will automatically restart and re-generate its swagger spec.

In another terminal, in the repo root again:
```
npm run watch
```
Now, whenever a swagger spec is re-generated, the api client library for that api will automatically be re-generated.

And in a third terminal:
```
cd clients/mobile
yarn install
npm run start
```
Now you should be running a React Native app that makes a call to `items-api`. Changes to any of the code will automatically be reflected in what's running.
