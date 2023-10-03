/**
 * Operation Datastore Functions
 *
 * @remarks
 * The operation datastore is a concept unique to the ExecuteSC operations in Massa.
 * It allows to send a table of keys and values (same format as the persistent datastore)
 * that will be taken into consideration when running the ExecuteSC operation, and will not
 * persist after that execution.
 *
 * This can be useful for setting initialization values such as ephemeral parameters.
 *
 * Use cases:
 * - When deploying a smart contract.
 * - When creating dynamically a smart contracts using it's bytecode.
 * - Producing a generic deployer that use the operation datastore instead of writing the
 * smart contract bytes directly into the deployer (not sure on how to achieve that ?).
 *
 * Note that there might be more use cases beyond what has been mentioned here.
 *
 * These functions provide an interface for interacting with the operation datastore.
 *
 */
import { env } from '../../env';
import { derKeys } from './util';

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

/**
 * Retrieves all the keys filtered with a prefix from the operation datastore.
 *
 * @returns - a list of keys (e.g. a list of byte array)
 *
 */
export function getOpKeysPrefix(
  prefix: StaticArray<u8>,
): Array<StaticArray<u8>> {
  let keysSer = env.getOpKeysPrefix(prefix);
  return derKeys(keysSer);
}
