/**
 * This file contains functions for interacting with the environment and execution
 * context of a smart contract.
 *
 * The functions in this file allow for accessing information such as owned addresses,
 * the address stack, and the amount of remaining gas for a smart contract execution.
 *
 * @module context
 */

import { env } from '../env/index';
import { Address } from './address';

/**
 * Parses a JSON-encoded string of addresses and returns an array of `Address` objects.
 *
 * @param str - A string containing a JSON-encoded array of addresses.
 *
 * @returns An array of `Address` objects.
 */
function json2Address(str: string): Array<Address> {
  str = str.substr(1, str.length - 2);

  const a = str.split(',');
  return a.map<Address>((x) => new Address(x.substring(1, x.length - 1)));
}

/**
 * Returns an array of addresses owned by the current execution context.
 *
 * This function calls the `env.ownedAddresses()` ABI function to get a JSON-encoded array of owned addresses.
 * It then uses the `json2Address` function to parse the string into an array of `Address` objects.
 *
 * @returns An array of `Address` objects owned by the current execution context.
 *
 * The owned addresses returned by this function are the addresses that the current execution
 * context has write access to.
 * This typically includes the current address itself, as well as any addresses that were
 * created by the current call to allow initializing them.
 *
 * @example
 * ```typescript
 * const owned = ownedAddresses();
 * for (let i = 0; i < owned.length; i++) {
 *   log(owned[i].toString());
 * }
 * ```
 *
 * @example
 * Example of a JSON-encoded array of addresses:
 * ```json
 * ["0xAS0123456789abcdef0123456789abcdef01234567", "AS0x89abcdef0123456789abcdef0123456789abcdef"]
 * ```
 */
export function ownedAddresses(): Array<Address> {
  return json2Address(env.ownedAddresses());
}

/**
 * Returns stack addresses.
 *
 * The first element of this list is the originator (creator of the transaction)
 * and the last is the address of the current smart-contract.
 *
 * When executing the ExecuteSC function, the list is composed of only one entry:
 * the initiator, the caller and the callee having with the same address.
 *
 * ExecuteSC when an account A sends an ExecuteSC operation, the stack at the
 * beginning of that execution is: bottom [ A ] top.
 *
 * CallSC when an account A sends a CallSC operation to call a function in a smart
 * contract B, the stack at the beginning of the execution of that function is:
 * bottom [ A, B ] top. Note: A and B can be the same.
 *
 * Call from one smart contract to another: when a function F from smart contract C
 * is being executed with the stack [A, B, C] and calls a function on a smart
 * contract D, the stack at the beginning of the execution of D’s function becomes:
 * bottom [A, B, C, D] top. When D’s function finishes, the stack becomes bottom [A, B, C]
 * top and the execution of F resumes.
 *
 * Autonomous SC a message sent at a moment when the stack was [A, B, C] and calling a target
 * function F of a smart contract D, will yield the following stack at the beginning
 * of the execution of the target function: bottom [C, D] top. Note: C and D can be the same.
 *
 * Local execution
 * local executions don’t change the stack, they allow executing foreign code in the current context.
 *
 */
export function addressStack(): Array<Address> {
  return json2Address(env.callStack());
}

/**
 * Returns caller's address.
 *
 * Caller is the person or the smart contract that directly called
 * the pending function.
 *
 * @returns the caller's address
 */
export function caller(): Address {
  const a = addressStack();
  return a.length < 2 ? callee() : a[a.length - 2];
}

/**
 * Returns callee's address.
 *
 * The "callee" refers to the contract that is currently being executed.
 *
 * @returns The address of the currently executing smart contract.
 */
export function callee(): Address {
  const a = addressStack();
  return a[a.length - 1];
}

/**
 * Return the address of the initial transaction creator (originator).
 *
 * @returns returns the stack element at the bottom of the address stack
 */
export function transactionCreator(): Address {
  return addressStack()[0];
}

/**
 * Returns the amount transferred in the current call.
 *
 * @returns value in the smallest unit.
 */
export function transferredCoins(): u64 {
  return env.callCoins();
}

/**
 * @returns the slot unix timestamp in milliseconds
 */
export function timestamp(): u64 {
  return env.time();
}

/**
 * Returns the remaining gas for the current smart contract execution.
 * Gas is a measure of the computational resources required to execute a transaction on the blockchain.
 * @returns The amount of remaining gas for the current transaction.
 */
export function remainingGas(): u64 {
  return env.remainingGas();
}
