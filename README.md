# Massa-as-sdk

Collection of tools, objects and functions, that are specific in usage only for Massa smart contracts in AssemblyScript 

Complete doc of all functions and object can be found here : 

- [`massa-as-sdk documentation`](https://massa.net)

## To Install
```sh
npm i --save-dev @massalabs/massa-as-sdk
```
## To Format
```sh
npm run fmt
```

## To test
```sh
npm run test
```

#Example

For instance here is a smart contract example generating an event "Hello World" on the blockchain 

import { generateEvent } from '@massalabs/massa-as-sdk';
```sh
export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```