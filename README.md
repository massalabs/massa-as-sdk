# Massa-as-sdk

_Massa Assemblyscript SDK_

A collection of tools, objects and functions, specific in usage for Massa smart contracts, in AssemblyScript. 

SDK enables us to import object classes (address, storage objects, etc), and use them without having to write all objects from scratch each time.

In order to call ABI functions, we import those functions in the smart-contract project, from the SDK dependency.
SDK is a set of tools, objects and functions, that are specific in usage only for Massa blockchain.

Contract standards (ERC-20, etc) have been removed from it.

Complete doc of all functions and object can be found here : 

- [`massa-as-sdk documentation`](https://as-sdk.docs.massa.net)

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

# Example

For instance here is a smart contract example generating an event "Hello World" on the blockchain 

```sh
import { generateEvent } from '@massalabs/massa-as-sdk';
export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```