import {toBytes} from '.';
import {env} from '../env';
import {Address} from './address';

/**
 * Sets (key, value) in the datastore of the callee's address.
 *
 * Note: Existing entries are overwritten and missing ones are created.
 *
 * @param {T} key
 * @param {T} value
 */
export function set<T>(key: T, value: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : value instanceof StaticArray<u8>
      ? (value as StaticArray<u8>)
      : new StaticArray<u8>(0);
  env.set(keyByte, valueByte);
}

/**
 * Sets (key, value) in the datastore of the given address.
 * Existing entries are overwritten and missing ones are created.
 *
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {T } key
 * @param {T} value
 */
export function setOf<T>(address: Address, key: T, value: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : value instanceof StaticArray<u8>
      ? (value as StaticArray<u8>)
      : new StaticArray<u8>(0);
  env.setOf(address.toByteString(), keyByte, valueByte);
}

/**
 * Returns (key, value) in the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {T} key
 *
 * @return {StaticArray<u8>}
 */
export function get<T>(key: T): StaticArray<u8> {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  return env.get(keyByte);
}

/**
 * Returns (key, value) in the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {Address} address
 * @param {T} key
 *
 * @return {StaticArray<u8>}
 */
export function getOf<T>(address: Address, key: T): StaticArray<u8> {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  return env.getOf(address.toByteString(), keyByte);
}

/**
 * Removes (key, value) from the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {T} key
 */
export function del<T>(key: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  env.del(keyByte);
}

/**
 * Removes (key, value) from the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {T} key
 */
export function deleteOf<T>(address: Address, key: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  env.deleteOf(address.toByteString(), keyByte);
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the callee's address.
 *
 * Note: do nothing if key is absent.
 *
 * @param {T} key
 * @param {T} value
 */
export function append<T>(key: T, value: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : value instanceof StaticArray<u8>
      ? (value as StaticArray<u8>)
      : new StaticArray<u8>(0);
  env.append(keyByte, valueByte);
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the given address.
 *
 * Note: do nothing if key is absent.
 * TODO: explains security mecanisms
 *
 * @param {Address} address target address
 * @param {T} key
 * @param {T} value value to append
 */
export function appendOf<T>(address: Address, key: T, value: T): void {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : value instanceof StaticArray<u8>
      ? (value as StaticArray<u8>)
      : new StaticArray<u8>(0);
  env.appendOf(address.toByteString(), keyByte, valueByte);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @param {T} key
 * @return {bool}
 */
export function has<T>(key: T): bool {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  return env.has(keyByte);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the given address.
 *
 * @param {Address} address
 * @param {T} key
 *
 * @return {bool}
 */
export function hasOf<T>(address: Address, key: T): bool {
  let keyByte =
    key instanceof String
      ? toBytes(key.toString())
      : key instanceof StaticArray<u8>
      ? (key as StaticArray<u8>)
      : new StaticArray<u8>(0);

  return env.hasOf(address.toByteString(), keyByte);
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
  bytecode: StaticArray<u8>,
): void {
  env.setBytecodeOf(address.toByteString(), bytecode);
}
