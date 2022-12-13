import { toBytes, fromBytes } from ".";
import { env } from "../env";
import { Address } from "./address";
import { Args } from "./arguments";

/**
 * Converts given value to StaticArray<u8> to match datastore expected format.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} value
 * @returns {StaticArray<u8>}
 */
function toDatastoreFormat<T>(value: T): StaticArray<u8> {
  if (idof<T>() == idof<StaticArray<u8>>()) {
    return changetype<StaticArray<u8>>(value);
  }

  if (isString<T>()) {
    return toBytes(changetype<string>(value));
  }

  if (idof<T>() == idof<Args>()) {
    return changetype<Args>(value).serialize();
  }

  // eslint-disable-next-line new-cap
  ERROR("type must be one of string, StaticArray<u8> or Args"); // this function call stop the compilation.

  // Not necessary, but when giving an unsupported type, avoid
  // `ERROR TS2355: A function whose declared type is not 'void' must return a value.`
  // which can be misleading when you try to figure out what caused the error.
  return new StaticArray<u8>(0);
}

/**
 * Converts given datastore retrieved value to wanted format.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {StaticArray<u8>} value
 * @returns {T}
 */
function fromDatastoreFormat<T>(value: StaticArray<u8>): T {
  if (idof<T>() == idof<StaticArray<u8>>()) {
    return changetype<T>(value);
  }

  if (isString<T>()) {
    return changetype<T>(fromBytes(value));
  }

  if (idof<T>() == idof<Args>()) {
    return changetype<T>(new Args(value));
  }

  // eslint-disable-next-line new-cap
  ERROR("type must be one of string, StaticArray<u8> or Args"); // this function call stop the compilation.

  // Not necessary, but when giving an unsupported type, avoid
  // `ERROR TS2355: A function whose declared type is not 'void' must return a value.`
  // which can be misleading when you try to figure out what caused the error.
  return changetype<T>(0);
}

/**
 * Sets (key, value) in the datastore of the callee's address.
 *
 * Note: Existing entries are overwritten and missing ones are created.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} key
 * @param {T} value
 */
export function set<T>(key: T, value: T): void {
  env.set(toDatastoreFormat(key), toDatastoreFormat<T>(value));
}

/**
 * Sets (key, value) in the datastore of the given address.
 * Existing entries are overwritten and missing ones are created.
 *
 * TODO: explains security mechanisms
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {Address} address
 * @param {T} key
 * @param {T} value
 */
export function setOf<T>(address: Address, key: T, value: T): void {
  env.setOf(
    address.toByteString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value)
  );
}

/**
 * Returns (key, value) in the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} key
 * @return {T}
 */
export function get<T>(key: T): T {
  const value: StaticArray<u8> = env.get(toDatastoreFormat(key));

  return fromDatastoreFormat<T>(value);
}

/**
 * Returns (key, value) in the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {Address} address
 * @param {T} key
 * @return {T}
 */
export function getOf<T>(address: Address, key: T): T {
  const value: StaticArray<u8> = env.getOf(
    address.toByteString(),
    toDatastoreFormat(key)
  );

  return fromDatastoreFormat<T>(value);
}

/**
 * Removes (key, value) from the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mechanisms
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} key
 */
export function del<T>(key: T): void {
  env.del(toDatastoreFormat(key));
}

/**
 * Removes (key, value) from the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mechanisms
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {Address} address
 * @param {T} key
 */
export function deleteOf<T>(address: Address, key: T): void {
  env.deleteOf(address.toByteString(), toDatastoreFormat(key));
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the callee's address.
 *
 * Note: do nothing if key is absent.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} key
 * @param {T} value
 */
export function append<T>(key: T, value: T): void {
  env.append(toDatastoreFormat(key), toDatastoreFormat(value));
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the given address.
 *
 * Note: do nothing if key is absent.
 * TODO: explains security mechanisms
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {Address} address target address
 * @param {T} key
 * @param {T} value value to append
 */
export function appendOf<T>(address: Address, key: T, value: T): void {
  env.appendOf(
    address.toByteString(),
    toDatastoreFormat(key),
    toDatastoreFormat(value)
  );
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {T} key
 * @return {bool}
 */
export function has<T>(key: T): bool {
  return env.has(toDatastoreFormat(key));
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the given address.
 *
 * @template {string|Args|StaticArray<u8>} T - string, Args or StaticArray<u8>
 * @param {Address} address
 * @param {T} key
 *
 * @return {bool}
 */
export function hasOf<T>(address: Address, key: T): bool {
  return env.hasOf(address.toByteString(), toDatastoreFormat(key));
}

/**
 *  Sets the executable bytecode of the callee's address.
 *
 * TODO: explains failure consequences.
 *
 * @param {StaticArray<u8>} bytecode
 */
export function setBytecode(bytecode: StaticArray<u8>): void {
  env.setBytecode(bytecode);
}

/**
 *  Sets the executable bytecode of the given address.
 *
 * TODO: explains security mecanisms.
 *
 * @param {Address} address target address
 * @param {StaticArray<u8>} bytecode
 */
export function setBytecodeOf(
  address: Address,
  bytecode: StaticArray<u8>
): void {
  env.setBytecodeOf(address.toByteString(), bytecode);
}
