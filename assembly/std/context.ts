import {env} from '../env/index';
import {Address} from './address';

/**
 * Returns an array of addresses.
 *
 * @param {string} str - json encode
 *
 * @return {Array<Address>}
 */
function json2Address(str: string): Array<Address> {
  str = str.substr(1, str.length - 2);

  const a = str.split(',');
  return a.map<Address>((x) =>
    Address.fromByteString(x.substring(1, x.length - 1)),
  );
}

/**
 * Returns owned addresses.
 *
 * TODO:
 * - explain function purpose
 * - explain format
 *
 * @return {Array<Address>}
 */
export function ownedAddresses(): Array<Address> {
  return json2Address(env.ownedAddresses());
}

/**
 * Returns stack addresses.
 *
 * The address stack is the list of the called modules' address.
 * You get all previously called since the address of
 * the originator (transaction creator).
 *
 * @return {Array<Address>} returns the full call stack as a list, bottom to top
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
 * @return {Address} returns the stack element just below the top
 */
export function caller(): Address {
  const a = addressStack();
  return a.length < 2 ? new Address('', false) : a[a.length - 2];
}

/**
 * Returns callee's address.
 *
 * Callee is the current smart-contract address.
 *
 * @return {Address} returns the stack element at the top of the stack
 */
export function callee(): Address {
  const a = addressStack();
  return a[a.length - 1];
}

/**
 * Return the address of the initial transaction creator (originator).
 *
 * @return {Address} returns the stack element at the bottom of the stack
 */
export function transactionCreator(): Address {
  return addressStack()[0];
}

/**
 * Returns the amount transferred in the current call.
 *
 * @return {u64} - value in the smallest unit.
 */
export function transferedCoins(): u64 {
  return env.callCoins();
}

/**
 * Returns the slot unix timestamp in milliseconds
 *
 * @return {u64}
 */
export function timestamp(): u64 {
  return env.time();
}

/**
 * Returns the remaining gas.
 * @return {u64}
 */
export function remainingGas(): u64 {
  return env.remainingGas();
}
