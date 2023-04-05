/**
 * This file contains functions for interacting with the environment and execution
 * context of a smart contract.
 *
 * The functions in this file allow for accessing information such as owned addresses,
 * the address stack, and the amount of remaining gas for a smart contract execution.
 *
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
 * Returns an array of addresses owned by the current execution context.
 *
 * @remarks
 * The owned addresses returned by this function are the addresses that the current
 * execution context has write access to.
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
 * @see
 * [The Address Stack documentation]( https://docs.massa.net/en/latest/web3-dev/smart-contracts/address-stack.html)
 * for more information.
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
 */
export function timestamp(): u64 {
  return env.time();
}

/**
 * Returns the remaining gas for the current smart contract execution.
 *
 * @remarks
 * Gas is a measure of the computational resources required to execute a transaction on the blockchain.
 *
 * @returns The amount of remaining gas for the current transaction.
 */
export function remainingGas(): u64 {
  return env.remainingGas();
}
