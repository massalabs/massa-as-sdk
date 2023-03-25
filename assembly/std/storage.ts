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
  ERROR('Generic type must be one of string, StaticArray<u8>, Args, or Uint8Array.');

  // This return statement is not strictly necessary, but it is included to avoid a misleading error message
  // in cases where the compilation would otherwise fail due to the lack of a return value for a non-void function
  return new StaticArray<u8>(0);
}

/**
 * Converts given datastore retrieved value to wanted format.
 *
 * @typeParam T - `string`, `Args` or `StaticArray<u8>`
 * @param value -
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

  // this function call stop the compilation.
  ERROR('type must be one of string, StaticArray<u8> or Args or Uint8Array');

  // Not necessary, but when giving an unsupported type, avoid
  // `ERROR TS2355: A function whose declared type is not 'void' must return a value.`
  // which can be misleading when you try to figure out what caused the error.
  return changetype<T>(0);
}

/**
 * Checks if the given type is compatible with the expected value types for a storage key.
 *
 * @remarks
 * This function checks if the given type is compatible with the expected value types for a storage key,
 * which includes `string`, `Args`, `StaticArray<u8>` and `Uint8Array` types. If the given type is compatible with any of
 * these types, the function returns `true`. Otherwise, it returns `false`.
 *
 * @typeParam T - the type to check for compatibility with the expected value types for a storage key
 *
 * @returns `true` if the given type is compatible with the expected value types for a storage key, `false` otherwise.
 */
function checkValueType<T>(key: T): bool {
  if (isString<T>() || idof<T>() == idof<Args>() || idof<T>() == idof<Uint8Array>() || idof<T>() == idof<StaticArray<u8>>()) {
    return true;
  } else {
    return false;
  }
}

/**
 * Sets a key-value pair in the datastore of the current address.
 *
 * @remarks
 * This function overwrites existing entries and creates missing ones. The types of the key and value must be
 * compatible with the expected value types for the datastore, which include `string`, `Args`, and `StaticArray<u8>`
 * types.
 *
 * @typeParam T - the type of the key and value, which must be one of `string`, `Args`, or `StaticArray<u8>`
 *
 * @param key - the key to set in the datastore
 * @param value - the value to set for the given key in the datastore
 *
 * @throws AT COMPILATION TIME an error if the given key or value type is not one of the supported types
 */
export function set<T>(key: T, value: T): void {
  //FIXME: if (!checkValueType<T>(key)) { is not working
  if (!isString<T>() 
      && idof<T>() != idof<Args>()
      && idof<T>() != idof<Uint8Array>()
      && idof<T>() != idof<StaticArray<u8>>()
  ) {
    ERROR('Type of key and value must be one of string, StaticArray<u8>, Args, or Uint8Array.');
  }

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
