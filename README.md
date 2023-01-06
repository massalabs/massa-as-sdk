# Massa-as-sdk

_Massa Assemblyscript SDK_

A collection of tools, objects and functions, specific in usage for Massa smart contracts, in AssemblyScript. 

SDK enables us to import object classes (address, storage objects, etc), and use them without having to write all objects from scratch each time.

It allows you to use Massa's ABI functions.

Complete documentation of all available functions and objects is here: 

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

Here is a smart-contract example generating an event "Hello World" on the blockchain:

```sh
import { generateEvent } from '@massalabs/massa-as-sdk';
export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```