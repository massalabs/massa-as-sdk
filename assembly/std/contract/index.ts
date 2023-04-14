/**
 * This namespace is used to interact with other **smart contract functions** and manipulate their **bytecode**.
 * It is located at **std/contract**.
 *
 * @remarks
 * In the file **calls.ts** you can find functions to interact with **smart contract functions** such as:
 * - {@link call}.
 * - {@link localCall}.
 * - {@link localExecution}.
 * - {@link functionExists}.
 * - {@link callerHasWriteAccess}.
 *
 * In the file **bytecode.ts** you can find functions to manipulate **smart contracts bytecode** such as:
 * - {@link getBytecode}.
 * - {@link getBytecodeOf}.
 * - {@link createSC}.
 *
 * @module
 *
 */
export * from './calls';
export * from './bytecode';
