import {env} from '../env';
import {Address} from './address';

/**
 * Sets (key, value) in the datastore of the callee's address.
 *
 * Note: Existing entries are overwritten and missing ones are created.
 *
 * @param {StaticArray<u8>} key
 * @param {StaticArray<u8>} value
 */
export function set(key: StaticArray<u8>, value: StaticArray<u8>): void {
  env.set(key, value);
}

/**
 * Sets (key, value) in the datastore of the given address.
 * Existing entries are overwritten and missing ones are created.
 *
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {StaticArray<u8>} key
 * @param {StaticArray<u8>} value
 */
export function setOf(
  address: Address,
  key: StaticArray<u8>,
  value: StaticArray<u8>,
): void {
  env.setOf(address.toByteString(), key, value);
}

/**
 * Returns (key, value) in the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {StaticArray<u8>} key
 *
 * @return {StaticArray<u8>}
 */
export function get(key: StaticArray<u8>): StaticArray<u8> {
  return env.get(key);
}

/**
 * Returns (key, value) in the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 *
 * @param {Address} address
 * @param {StaticArray<u8>} key
 *
 * @return {StaticArray<u8>}
 */
export function getOf(address: Address, key: StaticArray<u8>): StaticArray<u8> {
  return env.getOf(address.toByteString(), key);
}

/**
 * Removes (key, value) from the datastore of the callee's address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {StaticArray<u8>} key
 */
export function del(key: StaticArray<u8>): void {
  env.del(key);
}

/**
 * Removes (key, value) from the datastore of the given address.
 *
 * TODO: explains what happens on missing key.
 * TODO: explains security mecanisms
 *
 * @param {Address} address
 * @param {StaticArray<u8>} key
 */
export function deleteOf(address: Address, key: StaticArray<u8>): void {
  env.deleteOf(address.toByteString(), key);
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the callee's address.
 *
 * Note: do nothing if key is absent.
 *
 * @param {StaticArray<u8>} key
 * @param {StaticArray<u8>} value
 */
export function append(key: StaticArray<u8>, value: StaticArray<u8>): void {
  env.append(key, value);
}

/**
 * Appends value to existing data of the (key, value) in
 * the datastore of the given address.
 *
 * Note: do nothing if key is absent.
 * TODO: explains security mecanisms
 *
 * @param {Address} address target address
 * @param {StaticArray<u8>} key
 * @param {StaticArray<u8>} value value to append
 */
export function appendOf(
  address: Address,
  key: StaticArray<u8>,
  value: StaticArray<u8>,
): void {
  env.appendOf(address.toByteString(), key, value);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @param {StaticArray<u8>} key
 * @return {bool}
 */
export function has(key: StaticArray<u8>): bool {
  return env.has(key);
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the given address.
 *
 * @param {Address} address
 * @param {StaticArray<u8>} key
 *
 * @return {bool}
 */
export function hasOf(address: Address, key: StaticArray<u8>): bool {
  return env.hasOf(address.toByteString(), key);
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
