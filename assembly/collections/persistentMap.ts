/* eslint-disable max-len */
import {Storage} from '../std/index';

export const _KEY_ELEMENT_SUFFIX = '::';

/**
 * This class is one of several convenience collections built on top of the `Storage` class
 * It implements a map -- a persistent unordered map.
 *
 * To create a map
 *
 * ```ts
 * let map = new PersistentMap<string, string>("m")  // choose a unique prefix per account
 * ```
 *
 * To use the map
 *
 * ```ts
 * map.set(key, value)
 * map.get(key)
 * ```
 *
 * IMPORTANT NOTES:
 *
 * (1) The Map doesn't store keys, so if you need to retrieve them, include keys in the values.
 *
 * (2) Since all data stored on the blockchain is kept in a single key-value store under the contract account,
 * you must always use a *unique storage prefix* for different collections to avoid data collision.
 *
 * @typeParam K The generic type parameter `K` can be any [valid AssemblyScript type](https://docs.assemblyscript.org/basics/types).
 * @typeParam V The generic type parameter `V` can be any [valid AssemblyScript type](https://docs.assemblyscript.org/basics/types).
 */
export class PersistentMap<K, V> {
  private _elementPrefix: string;

  /**
   * Creates or restores a persistent map with a given storage prefix.
   * Always use a unique storage prefix for different collections.
   *
   * Example
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m") // note the prefix must be unique (per NEAR account)
   * ```
   * @param {string} prefix A prefix to use for every key of this map.
   */
  constructor(prefix: string) {
    this._elementPrefix = prefix + _KEY_ELEMENT_SUFFIX;
  }

  /**
   * @param {string} key - Search key.
   * @return {string} An internal string key for a given key of type K.
   */
  private _key(key: K): string {
    // @ts-ignore: TODO: Add interface that forces all K types to have toString
    return this._elementPrefix + key.toString();
  }

  /**
   * Checks whether the map contains a given key
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.contains("hello")      // false
   * map.set("hello", "world")
   * map.contains("hello")      // true
   * ```
   *
   * @param {string} key Key to check.
   * @return {bool} True if the given key present in the map.
   */
  contains(key: K): bool {
    return Storage.has(this._key(key));
  }

  /**
   * Removes the given key and related value from the map
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.set("hello", "world")
   * map.delete("hello")
   * ```
   *
   * Removes value and the key from the map.
   * @param {string} key Key to remove.
   */
  delete(key: K): void {
    Storage.del(this._key(key));
  }

  /**
   * Retrieves the related value for a given key, or uses the `defaultValue` if not key is found
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.set("hello", "world")
   * let found = map.get("hello")
   * let notFound = map.get("goodbye", "cruel world")
   *
   * assert(found == "world")
   * assert(notFound == "cruel world")
   * ```
   *
   * @param {K} key Key of the element.
   * @param {V} defaultValue The default value if the key is not present.
   * @return {V | null} Value for the given key or the default value.
   */
  get(key: K, defaultValue: V | null = null): V | null {
    if (!this.contains(key)) {
      return defaultValue;
    }

    if (isString<V>()) {
      // @ts-ignore
      return Storage.get(this._key(key));
    } else if (isInteger<V>()) {
      // @ts-ignore
      parseInt(Storage.get(this._key(key)), 10);
    } else if (isFloat<V>()) {
      // @ts-ignore
      return parseFloat(Storage.get(this._key(key)));
    } else if (isBoolean<V>()) {
      // @ts-ignore
      return Storage.get(this._key(key)).toLowerCase() == 'true' ? true : false;
    } else {
      // @ts-ignore
      return null;
    }

    return null;
  }

  /**
   * Retrieves a related value for a given key or fails assertion with "key not found"
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.set("hello", "world")
   * let result = map.getSome("hello")
   * // map.getSome("goodbye")  // will throw with failed assertion
   *
   * assert(result == "world")
   * ```
   *
   * @param {K} key Key of the element.
   * @return {V} Value for the given key or the default value.
   */
  getSome(key: K): V {
    assert(this.contains(key), 'key not found');
    const res = this.get(key, null);
    assert(res, 'bad result');
    return <V>res;
  }

  /**
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.set("hello", "world")
   * ```
   *
   * Sets the new value for the given key.
   * @param {K} key Key of the element.
   * @param {V} value The new value of the element.
   */
  set(key: K, value: V): void {
    if (isString<V>()) {
      // @ts-ignore
      Storage.set(this._key(key), value);
    } else if (isInteger<V>()) {
      // @ts-ignore
      Storage.set(this._key(key), value.toString());
    } else if (isFloat<V>()) {
      // @ts-ignore
      Storage.set(this._key(key), value.toString());
    } else if (isBoolean<V>()) {
      // @ts-ignore
      Storage.set(this._key(key), value.toString());
    } else {
      // @ts-ignore
      Storage.set(this._key(key), value.toString());
    }
  }
}
