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
  env.set(checkAndTransformInputTypes(key), checkAndTransformInputTypes(value));
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
  env.setOf(
    address.toByteString(),
    checkAndTransformInputTypes(key),
    checkAndTransformInputTypes(value),
  );
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
  return env.get(checkAndTransformInputTypes(key));
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
  return env.getOf(address.toByteString(), checkAndTransformInputTypes(key));
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
  env.del(checkAndTransformInputTypes(key));
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
  env.deleteOf(address.toByteString(), checkAndTransformInputTypes(key));
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
  env.append(
    checkAndTransformInputTypes(key),
    checkAndTransformInputTypes(value),
  );
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
  env.appendOf(
    address.toByteString(),
    checkAndTransformInputTypes(key),
    checkAndTransformInputTypes(value),
  );
}

/**
 * Checks if the (key, value) exists in the datastore
 * of the callee's address.
 *
 * @param {T} key
 * @return {bool}
 */
export function has<T>(key: T): bool {
  return env.has(checkAndTransformInputTypes(key));
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
  return env.hasOf(address.toByteString(), checkAndTransformInputTypes(key));
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

function checkAndTransformInputTypes<T>(param: T): StaticArray<u8> {
  let paramBytes: StaticArray<u8>;

  const isTString = isString<T>(param);
  const isTStaticArrayU8 = idof<T>() == idof<StaticArray<u8>>();
  const isValid = !isTString && !isTStaticArrayU8;

  if (isValid) {
    paramBytes = isTString
      ? toBytes(param as string)
      : (param as StaticArray<u8>);
  } else {
    abort('Error : Param is not a string nor a StaticArray<u8>');
  }

  return paramBytes;
}
