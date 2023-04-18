/**
 * This namespace is a compilation of utilities functions relative to **smart contract development**.
 * It is located at **utils**.
 *
 * @privateRemarks
 *
 * Please do not dump all your functions in this namespace.
 * Try to organize them in different files.
 *
 * If any files becomes too big, or is starting to be too specific,
 * don't hesitate to propose a new namespace.
 *
 * Here is the catalog of all functions organized by file:
 *
 * In the file **address.ts** you can find utilities functions to interact further with {@link Address} such as:
 * - {@link publicKeyToAddress}.
 * - {@link validateAddress}.
 * To be moved in the {@link Address} namespace.
 *
 * In the file **context.ts** you can find utilities functions about the **execution context** such as:
 * - {@link currentPeriod}.
 * - {@link currentThread}.
 * To be moved in the {@link Context} namespace.
 *
 * In the file **crypto.ts** you can find basic **cryptographic** functions such as:
 * - {@link sha256}.
 * - {@link isSignatureValid}.
 * - {@link toBase58}.
 *
 * In the file **events.ts** you can find functions to generate **events** in the blockchain such as:
 * - {@link generateEvent}.
 * - {@link createEvent}.
 *
 * In the file **logging.ts** you can find functions to generate **logs** in the blockchain such as:
 * - {@link print}.
 *
 * In the file **random.ts** you can find functions to generate **random numbers** such as:
 * - {@link unsafeRandom}.
 *
 * In the file **file-utils.ts** you can find functions to manipulate **files** such as:
 * - {@link fileToByteArray}.
 *
 * @module
 *
 */

export * from './address';
export * from './context';
export * from './crypto';
export * from './events';
export * from './logging';
export * from './random';
export * from './file-utils';
