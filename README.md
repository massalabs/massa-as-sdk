# Massa-as-sdk

![check-code-coverage](https://img.shields.io/badge/coverage-%25-red)

Massa-as-sdk is a collection of tools, objects, and functions specifically designed for Massa smart contracts in AssemblyScript. This SDK enables you to import object classes, such as address and storage objects, and use them without having to write them from scratch every time. Additionally, it allows you to use Massa's ABI functions.

> _Massa-as-sdk is part of the Massa smart contract tooling. To learn more about Massa and its capabilities, visit the [Massa website](https://massa.net)._

## Installation
To use Massa-as-sdk in your AssemblyScript project, simply add it as a dependency:

```sh
npm i --save-dev @massalabs/massa-as-sdk
```

## Usage
After installing Massa-as-sdk, you can import the object classes and functions that you need in your AssemblyScript smart contract.

For example, to use the generateEvent function and generate a "Hello, World!" event, you can import and use it like this:

```typescript
import { generateEvent } from '@massalabs/massa-as-sdk';

// This main function is called automatically when the smart contract is executed by the blockchain.
// The function argument is unused and can be safely ignored.
export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello, World!`);
}
```

Similarly, you can use other classes and functions provided by Massa-as-sdk.
Refer to the [technical documentation](https://as-sdk.docs.massa.net/index.html) for more information.

## Contributing
We welcome contributions from the community!

If you would like to contribute to Massa-as-sdk, please read the [CONTRIBUTING file](CONTRIBUTING.md).

## License
Massa-as-sdk is released under the [MIT License](LICENSE).

## Powered By
Massa-as-sdk is developed with love by MassaLabs and powered by a variety of [open-source projects](powered-by.md).
