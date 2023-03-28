/**
 * This module contains functions for interacting with the key-value datastore, which is used for persistent storage of
 * data on the blockchain.
 *
 * The supported value types for the datastore include `string`, `Args`, `Uint8Array` and `StaticArray<u8>`.
 *
 * This module also provides functions for setting the executable bytecode of a smart contract address.
 *
 * @remarks
 * The datastore is used to store data that is expected to persist between contract executions, such as contract
 * state or user information.
 *
 * The [set](../functions/Storage.set.html), [get](../functions/Storage.get.html),
 * [has](../functions/Storage.has.html), and [del](../functions/Storage.del.html) functions are used to manipulate
 * the data in the datastore of the current address, while the [setOf](../functions/Storage.setOf.html),
 * [getOf](../functions/Storage.getOf.html), [hasOf](../functions/Storage.hasOf.html), and
 * [deleteOf](../functions/Storage.deleteOf.html) functions are used to manipulate the datastore of a specific address.
 *
 * The `setOf` and `deleteOf` functions can only be called at smart contract generation time by the
 * parent smart contract to write to or delete data from the child's datastore. These functions allow the parent smart
 * contract to manipulate the child smart contract's datastore during the smart contract execution time where
 * [createSC](../functions/createSC.html) is called, but not after.
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
 * @module storage
 */

import { env } from '../env';
import { Address } from './address';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';

/**
 * Converts the given value to a StaticArray<u8> to match the expected format for datastore operations.
 *
 * @remarks
 * This function supports converting values of type `string`, `StaticArray<u8>`, `Args`, or `Uint8Array` to
 * the appropriate format for datastore operations. If the given value is not one of these supported types,
 * an error will be thrown and the compilation will stop.
 *
 * @typeParam T - the type of the value to convert, which must be one of `string`, `StaticArray<u8>`, `Args`,
 * or `Uint8Array`
 *
 * @param value - the value to convert to the appropriate format for datastore operations
 *
 * @returns a StaticArray<u8> that represents the given value in the appropriate format for datastore operations
 *
 * @throws AT COMPILATION TIME an error if the given value is not one of the supported types
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

  if (idof<T>() == idof<Uint8Array>()) {
    return changetype<StaticArray<u8>>(value);
  }

  // If the value is not one of the supported types, throw an error and stop the compilation
  ERROR(
    'Generic type must be one of string, StaticArray<u8>, Args, or Uint8Array.',
  );

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
 * @typeParam T - the desired output type, which must be one of `string`, `Args`, `StaticArray<u8>` or Uint8Array
 *
 * @param value - the datastore retrieved value to be converted, of type `StaticArray<u8>`
 *
 * @returns the converted value in the desired format, of type `T`
 *
 * @throws AT COMPILATION TIME an error if the desired output type is not one of the supported types
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

  if (idof<T>() == idof<Uint8Array>()) {
    // @ts-ignore
    return changetype<Uint8Array>(value);
  }

  // If the desired output type is not one of the supported types, throw an error and stop the compilation
  ERROR('type must be one of string, StaticArray<u8>, Args, or Uint8Array.');

  // This return statement is not strictly necessary, but it is included to avoid a misleading error message
  // in cases where the compilation would otherwise fail due to the lack of a return value for a non-void function
  return changetype<T>(0);
}

/**
 * Checks if the given type is compatible with the expected value types for a storage key.
 *
 * @remarks
 * This function checks if the given type is compatible with the expected value types for a storage key,
 * which includes `string`, `Args`, `StaticArray<u8>` and `Uint8Array` types. If the given type is compatible
 * with any of these types, the function returns `true`. Otherwise, it returns `false`.
 *
 * @privateRemarks
 * we need to use nested if statement because compile time evaluation of as-coverage is
 * limited and doesn't support logical || and && operators in that case.
 *
 * @typeParam T - the type to check for compatibility with the expected value types for a storage key
 *
 * @returns `true` if the given type is compatible with the expected value types for a storage key, `false` otherwise.
 */
function checkValueType<T>(): void {
  if (!isString<T>()) {
    if (idof<T>() != idof<Args>()) {
      if (idof<T>() != idof<Uint8Array>()) {
        if (idof<T>() != idof<StaticArray<u8>>()) {
          ERROR(
            'Type of key and value must be one of string, StaticArray<u8>, Args, or Uint8Array.',
          );
        }
      }
    }
  }
}

/**
 * Sets a key-value pair in the current contract's datastore. Existing entries are overwritten and missing
 * ones are created.
 *
 * @remarks
 * - If the key/value provided is not of type string, StaticArray<u8>, Args, or Uint8Array,
 * an error will be thrown and the compilation will stop. Key and value must be of the same type.
 *
 * @privateRemarks
 * The checkValueType function is used in our codebase to ensure that the key and value being set are of the same type.
 * Currently, if a type mismatch is detected, the function will trigger an error message that specifies the line number
 * where checkValueType is implemented. However, this can be confusing and unhelpful for developers who need to identify
 * the location in their code where the type mismatch actually occurred. We are working on a solution to this issue.
 *
 * @typeParam T - The type of the key-value pair. Can be either `string`, `StaticArray<u8>`, `Args`, or `Uint8Array`.
 *
 * @param key - The key to set in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 * @param value - The value to associate with the key in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 *
 * @throws Throws an error if the key or value cannot be converted to a StaticArray<u8>.
 *
 */
export function set<T>(key: T, value: T): void {
  checkValueType<T>();
  env.set(toDatastoreFormat<T>(key), toDatastoreFormat<T>(value));
}

/**
 * Sets a key-value pair in the datastore of the given address. Existing entries are overwritten and missing
 * ones are created.
 *
 * @remarks
 * - If the key/value provided is not of type string, StaticArray<u8>, Args, or Uint8Array,
 * an error will be thrown and the compilation will stop. Key and value must be of the same type.
 *
 * @privateRemarks
 * TODO: Explain the security mechanisms in place to ensure that only authorized parties
 * can set data in the datastore.
 *
 * @typeParam T - The type of the key-value pair. Can be either string, Args, or StaticArray<u8>.
 *
 * @param address - The address of the datastore to write the key-value pair to.
 *
 * @param key - The key to set in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 * @param value - The value to associate with the key in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 *
 * @throws Throws an error if the key or value cannot be converted to a StaticArray<u8>.
 *
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
 * @remarks
 * - If there is no value associated with the `key`, an error will be thrown by the node:
 * Runtime error: data entry not found.
 *
 * @typeParam T - The type of the key-value pair. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 *
 * @param key - The key whose associated value is to be retrieved from the datastore. It will be converted
 * to a `StaticArray<u8>` using the `toDatastoreFormat()` function.
 *
 * @returns The value associated with the given `key` in the datastore, or throw an error: data entry not found.
 *
 */
export function get<T>(key: T): T {
  const value: StaticArray<u8> = env.get(toDatastoreFormat(key));

  return fromDatastoreFormat<T>(value);
}

/**
 * Returns the value associated with the given `key` in the datastore of the contract at the specified `address`.
 *
 * @remarks
 * - If there is no value associated with the `key`, the function will throw an error.
 * - If the contract at the given address does not exist, the function will throw an error.
 *
 * @typeParam T - The type of the key-value pair. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 *
 * @param address - The address of the contract whose datastore is being queried.
 * @param key - The key whose associated value is to be retrieved from the datastore. It will be converted
 * to a `StaticArray<u8>` using the `toDatastoreFormat()` function.
 *
 * @returns The value associated with the given `key` in the datastore of the specified contract, or throws an
 * error if no value is found.
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
 * @remarks
 * - If the key is not of type string, StaticArray<u8>, Args, or Uint8Array, an error will be thrown and
 * the compilation will stop.
 * - If the caller is not authorized to delete the key-value pair, an error will be thrown.
 * - If the `key` does not exist in the datastore, an error will be thrown.
 *
 * @privateRemarks
 * TODO: describe the security mechanisms involved in this operation.
 *
 * @typeParam T - The type of the key to delete. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 *
 * @param key - The key to delete from the datastore. It will be converted to a `StaticArray<u8>` using
 * the `toDatastoreFormat()` function.
 *
 */
export function del<T>(key: T): void {
  env.del(toDatastoreFormat(key));
}

/**
 * Removes the key-value pair associated with the given `key` from the datastore of the specified `address`.
 *
 * @privateRemarks
 * - If the key is not of type string, StaticArray<u8>, Args, or Uint8Array, an error will be thrown and
 * the compilation will stop.
 * - If the caller is not authorized to delete the key-value pair, an error will be thrown.
 * - If the `key` does not exist in the datastore, an error will be thrown.
 * - If the contract at the given address does not exist, the function will throw an error.
 *
 * @typeParam T - The type of the key to delete. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 * @param address - The address of the contract whose datastore is being queried.
 * @param key - The key whose associated value is to be retrieved from the datastore. It will be converted
 * to a `StaticArray<u8>` using the `toDatastoreFormat()` function.
 */
export function deleteOf<T>(address: Address, key: T): void {
  env.deleteOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Appends the `value` to the existing data associated with the `key` in the datastore of the current contract.
 *
 * @remarks
 * - If the key is not of type string, StaticArray<u8>, Args, or Uint8Array, an error will be thrown and
 * the compilation will stop.
 * - If the `key` does not exist in the datastore, an error will be thrown.
 *
 * @typeParam T - The type of the key and value to append. Can be either `string`, `Args`, `StaticArray<u8>`
 * or Uint8Array.
 *
 * @param key - The key whose data the `value` will be appended to. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 * @param value - The data that will be appended to the existing data associated with the `key`. It will be converted
 * to a `StaticArray<u8>` using the `toDatastoreFormat()` function.
 *
 */
export function append<T>(key: T, value: T): void {
  env.append(toDatastoreFormat(key), toDatastoreFormat(value));
}

/**
 * Appends the `value` to the existing data associated with the `key` in the datastore of the specified `address`.
 *
 * @remarks
 * - If the `key` is not of type `string`, `Args`, `StaticArray<u8>`, or `Uint8Array`, an error will be thrown and
 * the compilation will stop.
 * - If the `key` does not exist in the datastore, an error will be thrown.
 * - If the contract at the given address does not exist, the function will throw an error.
 *
 * @typeParam T - The type of the key and value to append. Can be either `string`, `Args`, `StaticArray<u8>` or
 * Uint8Array.
 *
 * @param address - The address whose datastore the `value` will be appended to.
 * @param key - The key whose data the `value` will be appended to. It will be converted to a `StaticArray<u8>` using
 * the `toDatastoreFormat()` function.
 * @param value - The data that will be appended to the existing data associated with the `key`. It will be converted
 * to a `StaticArray<u8>` using the `toDatastoreFormat()` function.
 *
 */
export function appendOf<T>(address: Address, key: T, value: T): void {
  env.appendOf(
    address.toString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value),
  );
}

/**
 * Checks if the key-value pair exists in the datastore of the callee's address.
 *
 * @remarks
 * - If the `key` is not of type `string`, `Args`, `StaticArray<u8>` or Uint8Array, an error will be thrown and
 * the compilation will stop.
 *
 * @typeParam T - The type of the `key`. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 *
 * @param key - The key to check for existence in the datastore. It will be converted to a `StaticArray<u8>` using
 * the `toDatastoreFormat()` function.
 *
 * @returns A boolean value indicating whether the key-value pair exists in the datastore or not.
 */

export function has<T>(key: T): bool {
  return env.has(toDatastoreFormat(key));
}

/**
 * Checks if the key-value pair exists in the datastore of the callee's address.
 *
 * @remarks
 * - If the `key` is not of type `string`, `Args`, `StaticArray<u8>` or Uint8Array, an error will be thrown and
 * the compilation will stop.
 * - If the contract at the given `address` does not exist, the function will throw an error.
 *
 * @typeParam T - The type of the `key`. Can be either `string`, `Args`, `StaticArray<u8>` or Uint8Array.
 *
 * @param address - The address whose datastore to check for the key-value pair.
 * @param key - The key to check for existence in the datastore. It will be converted to a `StaticArray<u8>` using
 * the `toDatastoreFormat()` function.
 *
 * @returns A boolean value indicating whether the key-value pair exists in the datastore or not.
 */
export function hasOf<T>(address: Address, key: T): bool {
  return env.hasOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Sets the executable bytecode of the callee's address.
 *
 * @remarks
 * - If the callee's address does not correspond to a smart contract in the ledger,
 * setting the bytecode will be disallowed, and a runtime error will be returned.
 * - If the caller lacks write permissions on the callee's address,
 * setting the bytecode will be disallowed, and a runtime error will be returned.
 * - If the callee's address is the same as the creator's address,
 * setting the bytecode will be disallowed, as it is not a smart contract address.
 * - If an error occurs while updating the bytecode in the speculative ledger,
 * the operation will fail, and the error will be returned.
 *
 * @param bytecode - The bytecode to be set for the callee's address. It should be a `StaticArray<u8>`.
 */
export function setBytecode(bytecode: StaticArray<u8>): void {
  env.setBytecode(bytecode);
}

/**
 *  Sets the executable bytecode of the given address.
 *
 * @privateRemarks
 * TODO: explains security mechanisms.
 *
 * @param address - target address -
 * @param bytecode -
 */
export function setBytecodeOf(
  address: Address,
  bytecode: StaticArray<u8>,
): void {
  env.setBytecodeOf(address.toString(), bytecode);
}
