/**
 * This namespace is used to interact with other **smart contract functions** and manipulate their **bytecode**.
 * It is located at **contract**.
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
 * In the file **calls.ts** you can find functions to interact with **smart contract functions** such as:
 * - {@link call}.
 * - {@link localCall}.
 * - {@link localExecution}.
 * - {@link functionExists}.
 * - {@link callerHasWriteAccess}.
 * - {@link sendMessage}.
 * - {@link getOriginOperationId}.
 *
 * In the file **bytecode.ts** you can find functions to manipulate **smart contracts bytecode** such as:
 * - {@link getBytecode}.
 * - {@link getBytecodeOf}.
 * - {@link setBytecode}.
 * - {@link setBytecodeOf}.
 * - {@link createSC}.
 *
 * In the file **fileToByteArray.ts** you can find a function that convert a **smart-contract file** to a **byteArray**:
 * - {@link fileToByteArray}.
 *
 *
 * @module
 *
 */
export * from './calls';
export * from './bytecode';
export * from './fileToByteArray';
