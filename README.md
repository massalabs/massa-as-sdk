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

## To generate doc
```sh
npm run doc
```

#Example

For instance here is a smart contract example generating an event "Hello World" on the blockchain 

```sh
import { generateEvent } from '@massalabs/massa-as-sdk';
export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```