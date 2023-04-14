import { env } from '../../env';
import { derKeys } from './util';

/**
 * Retrieves all the keys from the operation datastore.
 *
 * @param prefix - the serialized prefix to filter the keys (optional)
 *
 * @returns - a list of keys (e.g. a list of byte array)
 *
 */
export function getKeys(
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeys(prefix);
  return derKeys(keysSer);
}

/**
 * Retrieves all the keys from the operation datastore from a remote address.
 *
 * @param address - the address in the datastore
 * @param prefix - the prefix to filter the keys (optional)
 *
 * @returns - a list of key (e.g. a list of byte array)
 *
 */
export function getKeysOf(
  address: string,
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeysOf(address, prefix);
  return derKeys(keysSer);
}

/**
 * Checks if a given serialized 'key' is present in the operation datastore.
 *
 * @param key - the serialized key to look for in the datastore.
 *
 * @returns - true if key is present in datastore, false otherwise.
 *
 */
export function hasOpKey(key: StaticArray<u8>): bool {
  let result = env.hasOpKey(key);
  // From https://doc.rust-lang.org/reference/types/boolean.html &&
  // https://www.assemblyscript.org/types.html
  // we can safely cast from u8 to bool
  return bool(result[0]);
}

/**
 * Retrieves the data associated with the given key from the operation datastore.
 *
 * @param key - the serialized key to look for in the datastore.
 *
 * @returns - the serialized data associated with the given key as a byte array.
 *
 * @throws
 * - if the key is not present in the datastore.
 *
 */
export function getOpData(key: StaticArray<u8>): StaticArray<u8> {
  return env.getOpData(key);
}

/**
 * Retrieves all the keys from the operation datastore.
 *
 * @returns - a list of keys (e.g. a list of byte array)
 *
 */
export function getOpKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getOpKeys();
  return derKeys(keysSer);
}
