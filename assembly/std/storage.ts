import {env} from '../env';
import {Address} from './address';
import {toBytes} from '@massalabs/massa-as-sdk/assembly/std';

/**
 * Sets (key, value) in the datastore of the callee's address.
 *
 * Note: Existing entries are overwritten and missing ones are created.
 *
 * @param {StaticArray<u8> | string} key
 * @param {StaticArray<u8> | string} value
 */
export function set(
  key: StaticArray<u8> | string,
  value: StaticArray<u8> | string,
): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : (value as StaticArray<u8>);
  env.set(keyByte, valueByte);
}

/**
 * Sets (key, value) in the datastore of the given address.
 * Existing entries are overwritten and missing ones are created.
 *
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {StaticArray<u8> | string } key
 * @param {StaticArray<u8> | string} value
 */
export function setOf(
  address: Address,
  key: StaticArray<u8> | string,
  value: StaticArray<u8> | string,
): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : (value as StaticArray<u8>);
  env.setOf(address.toByteString(), keyByte, valueByte);
}

/**
 * Returns (key, value) in the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {StaticArray<u8> | string} key
 *
 * @return {StaticArray<u8>}
 */
export function get(key: StaticArray<u8> | string): StaticArray<u8> {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  return env.get(keyByte);
}

/**
 * Returns (key, value) in the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {Address} address
 * @param {StaticArray<u8> | string} key
 *
 * @return {StaticArray<u8>}
 */
export function getOf(
  address: Address,
  key: StaticArray<u8> | string,
): StaticArray<u8> {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  return env.getOf(address.toByteString(), keyByte);
}

/**
 * Removes (key, value) from the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {StaticArray<u8> | string} key
 */
export function del(key: StaticArray<u8> | string): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  env.del(keyByte);
}

/**
 * Removes (key, value) from the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {StaticArray<u8> | string} key
 */
export function deleteOf(
  address: Address,
  key: StaticArray<u8> | string,
): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  env.deleteOf(address.toByteString(), keyByte);
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the callee's address.
 *
 * Note: do nothing if key is absent.
 *
 * @param {StaticArray<u8> | string} key
 * @param {StaticArray<u8> | string} value
 */
export function append(
  key: StaticArray<u8> | string,
  value: StaticArray<u8> | string,
): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : (value as StaticArray<u8>);
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
 * @param {StaticArray<u8> | string} key
 * @param {StaticArray<u8> | string} value value to append
 */
export function appendOf(
  address: Address,
  key: StaticArray<u8> | string,
  value: StaticArray<u8> | string,
): void {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  let valueByte =
    value instanceof String
      ? toBytes(value.toString())
      : (value as StaticArray<u8>);
  env.appendOf(address.toByteString(), keyByte, valueByte);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @param {StaticArray<u8> | string} key
 * @return {bool}
 */
export function has(key: StaticArray<u8> | string): bool {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
  return env.has(keyByte);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the given address.
 *
 * @param {Address} address
 * @param {StaticArray<u8> | string} key
 *
 * @return {bool}
 */
export function hasOf(address: Address, key: StaticArray<u8> | string): bool {
  let keyByte =
    key instanceof String ? toBytes(key.toString()) : (key as StaticArray<u8>);
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
