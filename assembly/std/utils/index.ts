/**
 * This namespace is a compilation of utilities functions relative to **smart contract development**.
 * It is located at **utils**.
 *
 * @remarks
 * Here is the catalog of all functions organized by file:
 *
 * In the file **address.ts** you can find utilities functions to interact further with {@link Address} such as:
 * - {@link publicKeyToAddress}.
 * - {@link validateAddress}.
 *
 * In the file **context.ts** you can find utilities functions about the **execution context** such as:
 * - {@link currentPeriod}.
 * - {@link currentThread}.
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