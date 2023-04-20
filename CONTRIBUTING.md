# Contributing to Massa-as-sdk
Thank you for considering contributing to Massa-as-sdk!

## Reporting Bugs
If you discover a bug, please create a [new issue](https://github.com/massalabs/massa-as-sdk/issues/new?assignees=&labels=issue%3Abug&template=bug.md&title=) on our GitHub repository.
In your issue, please include a clear and concise description of the bug, any relevant code snippets, error messages, and steps to reproduce the issue.

## Installation
To start developing with Massa-as-sdk, you must install all the necessary dev dependencies. You can do so by running the following command:

```sh
npm install
```

This will install all the required packages listed in the package.json file, allowing you to update, fix, or improve Massa-as-sdk in any way you see fit. 

## Contributing Code
We welcome contributions in the form of bug fixes, enhancements, and new features.

To contribute code, please follow these steps:

1. Fork the Massa-as-sdk repository to your own account.
2. Create a new branch from the `main` branch for your changes.
3. Make your changes and commit them to your branch.
4. Push your branch to your fork.
5. Create a pull request from your branch to the develop branch of the Massa-as-sdk repository.

> **NOTE:** When creating a pull request, please include a clear and concise title and description of your changes, as well as any relevant context or background information.

### Contributing Namespaces
They are a few things to know about namespaces to contribute to Massa-as-sdk.
All namespaces are located in the `assembly/std/` directory, and each namespace is in its own directory.

If you want to add a new feature, make sure you add it in the correct namespace.
However you can decide that a namespace is getting to big or a mess.

So if you think you have a great new namespace idea, don't hesitate to create a new one.
Just make sure you add sufficient documentation to your namespace and functions.


## Code Style
Please ensure that your code follows the existing code style used in the project.
We use the [MassaLabs Prettier configuration](https://github.com/massalabs/prettier-config-as) and [MassaLabs ESLint configuration](https://github.com/massalabs/eslint-config) for formatting and linting.

You can run the following command to format your code before committing:

```sh
npm run fmt
```

## Tests
Please ensure that your changes include any necessary tests.
We use [as-pect library](https://as-pect.gitbook.io/as-pect/) for unit testing.

You can run the following command to run the tests:

```sh
npm run test
```

## License
By contributing to Massa-as-sdk, you agree that your contributions will be licensed under the MIT License.

## Documentation
Massa-as-sdk provides complete documentation of all available functions and objects.

To generate the documentation for a specific branch, run the following command:

```sh
npm run doc
```

The documentation will be generated in the `docs/documentation/html` directory.