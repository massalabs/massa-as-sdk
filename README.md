# Massa-as-sdk
![check-code-coverage](https://img.shields.io/badge/coverage-70%25-green)


**Massa Assemblyscript SDK**

Massa-as-sdk is a collection of tools, objects, and functions that are specifically designed for Massa smart contracts in AssemblyScript. This SDK allows you to import object classes such as address and storage objects and use them without having to write them from scratch every time. Additionally, it enables you to use Massa's ABI functions.

## Installation

You can easily install Massa-as-sdk using npm. Simply run the following command:

```sh
npm i --save-dev @massalabs/massa-as-sdk
```

## Usage

Once you have installed Massa-as-sdk, you can start using it in your smart contracts. Here's an example of a smart contract that generates an event "Hello World" on the blockchain:

```typescript
import { generateEvent } from '@massalabs/massa-as-sdk';

export function main(_: StaticArray<u8>): void {
  generateEvent(`Hello World`);
}
```

## Formatting

You can format your code using the following command:

```sh
npm run fmt
```

## Testing

You can run tests for Massa-as-sdk using the following command:

```sh
npm run test
```

## Documentation

Massa-as-sdk provides complete documentation of all available functions and objects. You can generate the documentation using the following command:

```sh
npm run doc
```

You can access the documentation at [massa-as-sdk documentation](https://as-sdk.docs.massa.net).

## Contributing

We welcome contributions to Massa-as-sdk. If you want to contribute, please follow the guidelines in the CONTRIBUTING.md file.

## License

Massa-as-sdk is released under the MIT License. See the LICENSE file for more details.

## Powered by

Massa-as-sdk is powered by Massa Labs. You can learn more about Massa Labs at https://massa.net.