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
 *    or `Uint8Array`
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
 * `StaticArray<u8>`. If the desired output type is not one of these supported types, an error will be
 * thrown and the compilation will stop.
 *
 * @typeParam T - the desired output type, which must be one of `string`, `Args`, or `StaticArray<u8>`
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
 * @typeParam T - the type to check for compatibility with the expected value types for a storage key
 *
 * @returns `true` if the given type is compatible with the expected value types for a storage key, `false` otherwise.
 */

// @ts-ignore: decorator
@inline
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
 * Sets a key-value pair in the current contract's datastore.
 *
 * @remarks If the key/value provided is not of type string, StaticArray<u8>, Args, or Uint8Array,
 * an error will be thrown and the compilation will stop. Key and value must be of the same type.
 *
 * @typeParam T - The type of the key-value pair. Can be either `string`, `StaticArray<u8>`, `Args`, or `Uint8Array`.
 *
 * @param key - The key to set in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 * @param value - The value to associate with the key in the datastore. It will be converted to a `StaticArray<u8>`
 * using the `toDatastoreFormat()` function.
 *
 * @throws Throws an error at compilation time if the key is not of type `string`, `StaticArray<u8>`, `Args`,
 * or `Uint8Array`.
 *
 */
export function set<T>(key: T, value: T): void {
  checkValueType<T>();
  env.set(toDatastoreFormat<T>(key), toDatastoreFormat<T>(value));
}

/**
 * Sets (key, value) in the datastore of the given address.
 * Existing entries are overwritten and missing ones are created.
 *
 * @privateRemarks
 * TODO: explains security mechanisms
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param address -
 * @param key -
 * @param value -
 */
export function setOf<T>(address: Address, key: T, value: T): void {
  env.setOf(
    address.toString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value),
  );
}

/**
 * Returns (key, value) in the datastore of the callee's address.
 *
 * @privateRemarks
 * TODO: explains what happens on missing key.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param key -
 */
export function get<T>(key: T): T {
  const value: StaticArray<u8> = env.get(toDatastoreFormat(key));

  return fromDatastoreFormat<T>(value);
}

/**
 * Returns (key, value) in the datastore of the given address.
 *
 * @privateRemarks
 * TODO: explains what happens on missing key.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param address -
 * @param key -
 */
export function getOf<T>(address: Address, key: T): T {
  const value: StaticArray<u8> = env.getOf(
    address.toString(),
    toDatastoreFormat(key),
  );

  return fromDatastoreFormat<T>(value);
}

/**
 * Removes (key, value) from the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mechanisms
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param key -
 */
export function del<T>(key: T): void {
  env.del(toDatastoreFormat(key));
}

/**
 * Removes (key, value) from the datastore of the given address.
 *
 * @privateRemarks
 * TODO: explains what happens on missing key.
 * TODO: explains security mechanisms
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param address -
 * @param key -
 */
export function deleteOf<T>(address: Address, key: T): void {
  env.deleteOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the callee's address.
 *
 * Note: do nothing if key is absent.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param key -
 * @param value -
 */
export function append<T>(key: T, value: T): void {
  env.append(toDatastoreFormat(key), toDatastoreFormat(value));
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the given address.
 *
 * Note: do nothing if key is absent.
 *
 * @privateRemarks
 * TODO: explains security mechanisms
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param address - target address -
 * @param key -
 * @param value - value to append -
 */
export function appendOf<T>(address: Address, key: T, value: T): void {
  env.appendOf(
    address.toString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value),
  );
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param key -
 */
export function has<T>(key: T): bool {
  return env.has(toDatastoreFormat(key));
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the given address.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param address -
 * @param key -
 *
 */
export function hasOf<T>(address: Address, key: T): bool {
  return env.hasOf(address.toString(), toDatastoreFormat(key));
}

/**
 * Sets the executable bytecode of the callee's address.
 *
 * Failure consequences:
 * If the callee's address does not correspond to a smart contract in the ledger,
 * setting the bytecode will be disallowed, and a runtime error will be returned.
 * 1. If the caller lacks write permissions on the callee's address,
 * setting the bytecode will be disallowed, and a runtime error will be returned.
 * 2. If the callee's address is the same as the creator's address,
 * setting the bytecode will be disallowed, as it is not a smart contract address.
 * A runtime error will be returned in this case.
 * 3. If an error occurs while updating the bytecode in the speculative ledger,
 * the operation will fail, and the error will be returned.
 *
 * @param bytecode - The bytecode to be set for the callee's address.
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
