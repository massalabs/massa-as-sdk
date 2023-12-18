/**
 * This module provides functions for interacting with the execution context of a smart contract on the Massa
 * blockchain.
 *
 * The functions in this module allow you to retrieve information about the current execution context, such as the
 * caller and callee of the current smart contract, the call stack, the amount of transferred coins, the remaining gas,
 * and the timestamp.
 *
 * @remarks
 * The execution context is important for understanding the current state of the smart contract, such as who called
 * the contract, the current contract address, and the transaction creator.
 *
 * Functions such as {@link ownedAddresses}, {@link addressStack}, {@link caller}, {@link callee},
 * {@link transactionCreator}, {@link transferredCoins}, {@link timestamp}, {@link remainingGas},
 * {@link currentThread} and {@link currentPeriod} provide access to important context information
 * during smart contract execution.
 *
 * It is not possible in AssemblyScript to catch thrown exceptions.
 * All exceptions thrown by functions in this module will stop the execution of the smart contract.
 *
 * You can see that your smart contract execution is stopped by looking at the events.
 *
 * @privateRemarks
 * The `json2Address` function is used to parse a JSON-encoded string of addresses and return an array of `Address`
 * objects. This function is used internally by other functions in this module to convert string representations of
 * addresses into a more usable format.
 *
 * @module
 */

import { env } from '../env/index';
import { Address } from './address';
import { callerHasWriteAccess, Context } from '.';

/**
 * Determines whether the smart contract is currently being deployed.
 *
 * @remarks
 * This method is typically used in the constructor to ensure a one-time deployment
 * and initialization, usually by the creator of the contract. Under the hood, this method
 * verifies that the account calling this function (either the user creating the operation
 * or an upper contract) has write access to the data of the current account
 *
 * @returns true if the contract is currently being deployed, false otherwise.
 */
@inline
export function isDeployingContract(): bool {
  return callerHasWriteAccess() && Context.callee().notEqual(Context.caller());
}

/**
 * Returns an array of addresses.
 *
 * Parses a JSON-encoded string of addresses and returns an array of `Address` objects.
 *
 * @remarks
 * This function takes a string containing a JSON-encoded array of addresses
 * (ex: "[address1,address2,...,addressN]") and returns an array of `Address`
 * objects.
 *
 * @param str - A string containing a JSON-encoded array of addresses.
 *
 * @returns An array of `Address` objects, one for each address in the input string.
 */
function json2Address(str: string): Array<Address> {
  str = str.substr(1, str.length - 2);

  const a = str.split(',');
  return a.map<Address>((x) => new Address(x.substring(1, x.length - 1)));
}

/**
 * Returns the addresses that the current execution context has write access to.
 *
 * @remarks
 * Returned addresses include the current address itself, as well as any addresses that
 * were created by the current call to allow initializing them.
 *
 * @returns An array of `Address` objects owned by the current execution context.
 *
 */
export function ownedAddresses(): Array<Address> {
  return json2Address(env.ownedAddresses());
}

/**
 * Returns the current call stack of smart contract execution.
 *
 * @remarks
 * The first element of this list is the originator (creator of the transaction)
 * and the last is the address of the current smart-contract.
 *
 * When executing the ExecuteSC function, the list is composed of only one entry:
 * the initiator, the caller and the callee having with the same address.
 *
 * Here is a list of the different cases in the Massa stack system:
 *
 * **ExecuteSC**: when an account A sends an ExecuteSC operation, the stack at the
 * beginning of that execution is: bottom [ A ] top.
 *
 * **CallSC**: when an account A sends a CallSC operation to call a function in a smart
 * contract B, the stack at the beginning of the execution of that function is:
 * bottom [ A, B ] top. Note: A and B can be the same.
 *
 * **Call**: from one smart contract to another: when a function F from smart contract C
 * is being executed with the stack [A, B, C] and calls a function on a smart
 * contract D, the stack at the beginning of the execution of D’s function becomes:
 * bottom [A, B, C, D] top. When D’s function finishes, the stack becomes bottom [A, B, C]
 * top and the execution of F resumes.
 *
 * **Autonomous SC**: a message sent at a moment when the stack was [A, B, C] and calling a target
 * function F of a smart contract D, will yield the following stack at the beginning
 * of the execution of the target function: bottom [C, D] top. Note: C and D can be the same.
 *
 * **Local execution**: local executions don’t change the stack, they allow executing foreign code
 * in the current context.
 *
 * @returns An array of `Address` objects representing the call stack.
 */
export function addressStack(): Array<Address> {
  return json2Address(env.callStack());
}

/**
 * Returns the `address` of the `caller` of the currently executing smart contract.
 *
 * @remarks
 * The caller is the person or the smart contract that directly called
 * the pending function.
 *
 * @returns The `address` of the caller of the currently executing smart contract.
 */
export function caller(): Address {
  const a = addressStack();
  return a.length < 2 ? callee() : a[a.length - 2];
}

/**
 * Returns the address of the currently executing smart contract.
 *
 * @remarks
 * The "callee" refers to the contract that is currently being executed.
 *
 * @returns The `address` of the currently executing smart contract.
 */
export function callee(): Address {
  const a = addressStack();
  return a[a.length - 1];
}

/**
 * Returns the address of the initial transaction creator (originator).
 *
 * @returns The `address` of the initial transaction creator.
 */
export function transactionCreator(): Address {
  return addressStack()[0];
}

/**
 * Returns the amount transferred in the current call.
 *
 * @returns The value in the smallest unit.
 */
export function transferredCoins(): u64 {
  return env.callCoins();
}

/**
 * Returns the slot Unix timestamp in milliseconds.
 *
 * @returns The slot Unix timestamp in milliseconds.
 *
 */
export function timestamp(): u64 {
  return env.time();
}

/**
 * Returns the remaining gas for the current smart contract execution.
 *
 * @remarks
 * Gas is a measure of the computational resources required to execute a transaction on the blockchain.
 * When there is no more gas, the execution of the smart contract is interrupted and all the transactions are reversed.
 *
 * @returns The amount of remaining gas for the current transaction.
 *
 */
export function remainingGas(): u64 {
  return env.remainingGas();
}

/**
 * Retrieves the current period of the network.
 *
 * @returns the current period.
 *
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Retrieves the current thread of the execution context.
 *
 * @returns the current thread.
 *
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Retrieve the current chain id
 *
 * @returns the current chain id.
 */
export function chainId(): u64 {
  return env.chainId();
}
