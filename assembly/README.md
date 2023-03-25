
# Massa AssemblyScript SDK
Massa-as-sdk is a collection of tools, objects, and functions specifically designed for developing smart contracts
on the Massa blockchain using AssemblyScript.

This file is the entry point for the package, and it exports a number of modules, including:
- `collections`: provides higher order collection types for use in smart contract development
- `env`: provides native bindings to the Massa blockchain's environment
- `std`: contains standard Massa functionalities, such as address and storage objects
- `vm-mock`: provides mock utilities for testing smart contracts

To use Massa-as-sdk in your AssemblyScript smart contract, simply import the module(s) you need, for example:

```typescript
import { generateEvent } from '@massalabs/massa-as-sdk';

export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```

Please note that this package is intended for use by developers who are already familiar with Massa's smart contract tooling
and AssemblyScript.

If you are new to smart contract development or AssemblyScript, we recommend that you first familiarize
yourself with these technologies before attempting to use this package.
