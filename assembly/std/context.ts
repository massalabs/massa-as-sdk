import { callerHasWriteAccess, Context } from '.';
import { env } from '../env/index';
import { Address } from './address';

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
 * @param str - json encode
 */
function json2Address(str: string): Array<Address> {
  str = str.substr(1, str.length - 2);

  const a = str.split(',');
  return a.map<Address>((x) => new Address(x.substring(1, x.length - 1)));
}

/**
 * Returns owned addresses.
 *
 * TODO:
 * - explain function purpose
 * - explain format
 *
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
 * Callee is the current smart-contract address.
 *
 * @returns the called smart contract address
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
 * @returns the remaining gas
 */
export function remainingGas(): u64 {
  return env.remainingGas();
}
