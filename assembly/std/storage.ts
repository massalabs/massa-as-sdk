/**
 * This module contains functions for interacting with the key-value datastore, which is used for persistent storage of
 * data on the blockchain.
 *
 * The supported value types for the datastore include `string`, `Args` and `StaticArray<u8>`.
 *
 * This module also provides functions for setting the executable bytecode of a smart contract address.
 *
 * @remarks
 * The datastore is used to store data that is expected to persist between contract executions, such as contract
 * state or user information.
 *
 * The {@link set}, {@link get}, {@link has}, and {@link del} functions are used to manipulate the data in the
 * datastore of the current address, while the {@link setOf}, {@link getOf}, {@link hasOf}, and {@link deleteOf}
 * functions are used to manipulate the data in the datastore of a different address.
 *
 * The {@link setOf}, {@link deleteOf} and {@link appendOf} functions can only be called at smart contract generation
 * time by the parent smart contract to write to or delete data from the child's datastore. These functions allow the
 * parent smart contract to manipulate the child smart contract's datastore during the smart contract execution time
 * where {@link createSC} is called, but not after.
 *
 * It is not possible in AssemblyScript to catch thrown exceptions.
 * All exceptions thrown by functions in this module will stop the execution of the smart contract.
 *
 * You can see that your smart contract execution is stopped by looking at the events.
 *
 * @privateRemarks
 * AssemblyScript does not currently support union types, so we must manually check the compatibility of generic types
 * in some of the functions.
 *
 * The `ERROR` function is used to stop the compilation and inform the developer that one of the passed generic types is
 * not compatible with the expected type. Unfortunately, the `ERROR` function does not offer a way to pass the actual
 * generic type or the compilation context, except for the line where the error function was called. Therefore, it is
 * recommended to use the `ERROR` function as early as possible in the call process, and to avoid using sub-functions
 * called in the process in order to preserve the error context.
 *
 * @module
 */

import { env } from '../env';
import { Address } from './address';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';
import { derKeys } from './op-datastore';

/**
 * Converts the given value to a StaticArray<u8> to match the expected format for datastore operations.
 *
 * @remarks
 * This function supports converting values of type `string`, `StaticArray<u8>`, or  `Args` to
 * the appropriate format for datastore operations. If the given value is not one of these supported types,
 * an error will be thrown and the compilation will stop.
 *
 * @typeParam T - the type of the value to convert, which must be one of `string`, `StaticArray<u8>`, or `Args`
 *
 * @param value - the value to convert to the appropriate format for datastore operations
 *
 * @returns a StaticArray<u8> that represents the given value in the appropriate format for datastore operations
 *
 * @throws
 * - [compilation only] if the given value is not one of the supported types
 */
function toDatastoreFormat<T>(value: T): StaticArray<u8> {
  if (idof<T>() == idof<StaticArray<u8>>()) {
    return changetype<StaticArray<u8>>(value);
  }

  if (isString<T>()) {
    return stringToBytes(changetype<string>(value));
  }

  if (idof<T>() == idof<Args>()) {
    return changetype<Args>(value).serialize();
  }

  // If the value is not one of the supported types, throw an error and stop the compilation
  ERROR('Generic type must be one of string, StaticArray<u8>, or Args.');

  // This return statement is not strictly necessary, but it is included to avoid a misleading error message
  // in cases where the compilation would otherwise fail due to the lack of a return value for a non-void function
  return new StaticArray<u8>(0);
}

/**
 * Converts the given datastore retrieved value to the desired format.
 *
 * @remarks
 * This function supports converting values of type `StaticArray<u8>` to either `string`, `Args`, or
 * `StaticArray<u8>`.
 * - If the desired output type is not one of these supported types, an error will be
 * thrown and the compilation will stop.
 *
 * @typeParam T - the desired output type, which must be one of `string`, `Args`, or `StaticArray<u8>`
 *
 * @param value - the datastore retrieved value to be converted, of type `StaticArray<u8>`
 *
 * @returns the converted value in the desired format, of type `T`
 *
 * @throws
 * - [compilation only] if the desired output type is not one of the supported types
 */
function fromDatastoreFormat<T>(value: StaticArray<u8>): T {
  if (idof<T>() == idof<StaticArray<u8>>()) {
    return changetype<T>(value);
  }

  if (isString<T>()) {
    return changetype<T>(bytesToString(value));
  }

  if (idof<T>() == idof<Args>()) {
    return changetype<T>(new Args(value));
  }

  // If the desired output type is not one of the supported types, throw an error and stop the compilation
  ERROR('Generic type must be one of string, StaticArray<u8>, or Args.');

  // This return statement is not strictly necessary, but it is included to avoid a misleading error message
  // in cases where the compilation would otherwise fail due to the lack of a return value for a non-void function
  return changetype<T>(0);
}

/**
 * Sets a key-value pair in the current contract's datastore. Existing entries are overwritten and missing
 * ones are created.
 *
 * @typeParam T - Can be either `string`, `StaticArray<u8>`, or `Args`.
 *
 * @param key - The key to set in the datastore.
 * @param value - The value to associate with the key in the datastore.
 *
 * @throws
 * - [compilation only] if the `key` and `value` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function set<T>(key: T, value: T): void {
  env.set(toDatastoreFormat<T>(key), toDatastoreFormat<T>(value));
}

/**
 * Sets a key-value pair in the datastore of the given address. Existing entries are overwritten and missing
 * ones are created.
 *
 * @remarks Can only be called at smart contract generation time by the parent smart contract to the child's address.
 *
 * @typeParam T - Can be either string, Args, or StaticArray<u8>.
 *
 * @param address - The child smart contract `address`.
 * @param key - The key to set in the datastore.
 * @param value - The value to associate with the key in the datastore.
 *
 * @throws
 * - if the given address is not a valid address.
 * - [compilation only] if the `key` and `value` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function setOf<T>(address: Address, key: T, value: T): void {
  env.setOf(
    address.toString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value),
  );
}

/**
 * Returns the value associated with the given `key` in the current contract's datastore.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param key - The key whose associated value is to be retrieved from the datastore.
 *
 * @returns The value associated with the given `key` in the datastore.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function get<T>(key: T): T {
  const value: StaticArray<u8> = env.get(toDatastoreFormat(key));

  return fromDatastoreFormat<T>(value);
}

/**
 * Returns the value associated with the given `key` in the datastore of the contract at the specified `address`.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param address - The targeted smart contract `address`.
 * @param key - The key whose associated value is to be retrieved from the datastore.
 *
 * @returns The value associated with the given `key` in the datastore of the specified contract.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - if the datastore at the given `address` does not exist.
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 *
 */
export function getOf<T>(address: Address, key: T): T {
  const value: StaticArray<u8> = env.getOf(
    address.toString(),
    toDatastoreFormat(key),
  );

  return fromDatastoreFormat<T>(value);
}

/**
 * Removes the key-value pair associated with the given `key` from the current contract's datastore.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param key - The `key` to delete from the datastore.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 *
 */
export function del<T>(key: T): void {
  env.del(toDatastoreFormat(key));
}

/**
 * Removes the key-value pair associated with the given `key` from the datastore of the specified `address`.
 *
 * @remarks Can only be called at smart contract generation time by the parent smart contract to the child's address.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param address - The child smart contract `address`.
 * @param key - The `key` to delete from the datastore.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - if the contract at the given `address` does not exist
 * - if the caller is not authorized to modify the datastore.
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function deleteOf<T>(address: Address, key: T): void {
  env.deleteOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Appends the given `value` to the existing value associated with the given `key` of the current contract.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param key - The key whose data the `value` will be appended to.
 * @param value - The data that will be appended to the existing data associated with the `key`.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - [compilation only] if the `key` and `value` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function append<T>(key: T, value: T): void {
  env.append(toDatastoreFormat(key), toDatastoreFormat(value));
}

/**
 * Appends the given `value` to the existing value associated with the given `key` of the specified `address`.
 *
 * @remarks Can only be called at smart contract generation time by the parent smart contract to the child's address.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param address - The child smart contract `address`.
 * @param key - The key whose data the `value` will be appended to.
 * @param value - The data that will be appended to the existing data associated with the `key`.
 *
 * @throws
 * - if the `key` does not exist in the datastore.
 * - if the contract at the given `address` does not exist
 * - if the caller is not authorized to modify the datastore.
 * - [compilation only] if the `key` and `value` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function appendOf<T>(address: Address, key: T, value: T): void {
  env.appendOf(
    address.toString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value),
  );
}

/**
 * Checks if the key-value pair exists in the datastore of the current contract.
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param key - The key to check for existence in the datastore.
 *
 * @returns A boolean value indicating whether the key-value pair exists in the datastore or not.
 *
 * @throws
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function has<T>(key: T): bool {
  return env.has(toDatastoreFormat(key));
}

/**
 * Checks if the key-value pair exists in the datastore of the target address.
 *
 *
 * @typeParam T - Can be either `string`, `Args`, or `StaticArray<u8>`.
 *
 * @param address - The child smart contract `address`.
 * @param key - The key to check for existence in the datastore.
 *
 * @returns A boolean value indicating whether the key-value pair exists in the datastore or not.
 *
 * @throws
 * - if the contract at the given `address` does not exist
 * - [compilation only] if the `key` type are neither `string`, `StaticArray<u8>`, or `Args`.
 */
export function hasOf<T>(address: Address, key: T): bool {
  return env.hasOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Maximum number of keys returned by one datastore key query from execution version 2 (MIP-0002).
 *
 * It is the largest `count` accepted by {@link getKeysPage} and {@link getKeysOfPage}, and the largest number of
 * keys {@link getKeys} and {@link getKeysOf} can match before failing.
 */
export const MAX_DATASTORE_KEYS_PAGE: i32 = 500;

/**
 * Retrieves all the keys from the datastore.
 *
 * @deprecated From execution version 2 (MIP-0002), the call fails when more than {@link MAX_DATASTORE_KEYS_PAGE}
 * keys match `prefix`: the result is never truncated. Use {@link getKeysPage} for a datastore that can grow.
 *
 * @param prefix - the serialized prefix to filter the keys (optional)
 *
 * @returns - a list of keys (e.g. a list of byte array)
 *
 * @throws
 * - from MIP-0002, if more than {@link MAX_DATASTORE_KEYS_PAGE} keys match `prefix`.
 */
export function getKeys(
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeys(prefix);
  return derKeys(keysSer);
}

/**
 * Retrieves all the keys from the datastore from a remote address.
 *
 * @deprecated From execution version 2 (MIP-0002), the call fails when more than {@link MAX_DATASTORE_KEYS_PAGE}
 * keys match `prefix`: the result is never truncated. Use {@link getKeysOfPage} for a datastore that can grow.
 *
 * @param address - the address in the datastore
 * @param prefix - the prefix to filter the keys (optional)
 *
 * @returns - a list of key (e.g. a list of byte array)
 *
 * @throws
 * - from MIP-0002, if more than {@link MAX_DATASTORE_KEYS_PAGE} keys match `prefix`.
 */
export function getKeysOf(
  address: string,
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeysOf(address, prefix);
  return derKeys(keysSer);
}

/**
 * Retrieves one page of keys from the datastore, in ascending byte order.
 *
 * To read every key, pass the last key of the previous page as `startKey` until a page shorter than `count` is
 * returned:
 * ```ts
 * let cursor = new StaticArray<u8>(0);
 * while (true) {
 *   const page = Storage.getKeysPage(prefix, cursor);
 *   // ... process page ...
 *   if (page.length < MAX_DATASTORE_KEYS_PAGE) break;
 *   cursor = page[page.length - 1];
 * }
 * ```
 *
 * Process each page, then drop it. Do not concatenate pages into one array (a "get all keys" helper): the result
 * grows with the datastore, and decoding the keys costs gas per key. A datastore of a few thousand keys then exhausts
 * the contract memory (a few MB) or the gas of the operation, and a failed operation consumes all of its gas. When the
 * work does not fit in one operation, save the cursor in the datastore and resume from it in the next call.
 *
 * @remarks
 * Available from execution version 2 (MIP-0002). A contract calling this function cannot be deployed or executed
 * before MIP-0002 is active. Each call costs a flat amount of gas, whatever `count` and the number of keys returned.
 *
 * @param prefix - only keys starting with this prefix are returned. Empty matches every key.
 * @param startKey - exclusive cursor: only keys strictly greater than it are returned. Empty starts at the
 * beginning of the range.
 * @param count - maximum number of keys returned, in `1..=`{@link MAX_DATASTORE_KEYS_PAGE}.
 *
 * @returns - up to `count` keys
 *
 * @throws
 * - if `count` is outside `1..=`{@link MAX_DATASTORE_KEYS_PAGE}.
 */
export function getKeysPage(
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
  startKey: StaticArray<u8> = new StaticArray<u8>(0),
  count: i32 = MAX_DATASTORE_KEYS_PAGE,
): Array<StaticArray<u8>> {
  return derKeys(env.getKeysPage(prefix, startKey, count));
}

/**
 * Retrieves one page of keys from the datastore of a remote address, in ascending byte order.
 *
 * See {@link getKeysPage} for the pagination pattern.
 *
 * @remarks
 * Available from execution version 2 (MIP-0002). A contract calling this function cannot be deployed or executed
 * before MIP-0002 is active.
 *
 * @param address - the address whose datastore is read
 * @param prefix - only keys starting with this prefix are returned. Empty matches every key.
 * @param startKey - exclusive cursor: only keys strictly greater than it are returned. Empty starts at the
 * beginning of the range.
 * @param count - maximum number of keys returned, in `1..=`{@link MAX_DATASTORE_KEYS_PAGE}.
 *
 * @returns - up to `count` keys
 *
 * @throws
 * - if `count` is outside `1..=`{@link MAX_DATASTORE_KEYS_PAGE}.
 * - if the address does not exist.
 */
export function getKeysOfPage(
  address: string,
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
  startKey: StaticArray<u8> = new StaticArray<u8>(0),
  count: i32 = MAX_DATASTORE_KEYS_PAGE,
): Array<StaticArray<u8>> {
  return derKeys(env.getKeysOfPage(address, prefix, startKey, count));
}
