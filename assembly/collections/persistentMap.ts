/* eslint-disable max-len */
import { Storage } from '../std/index';
import {
  wrapStaticArray,
  bytesToI64,
  f64ToBytes,
  i64ToBytes,
  stringToBytes,
  unwrapStaticArray,
  boolToByte,
  bytesToString,
  bytesToF64,
  byteToBool,
  Result,
  Serializable,
} from '@massalabs/as-types';

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
 * @typeParam K - The generic type parameter `K` can be any [valid AssemblyScript type](https://docs.assemblyscript.org/basics/types).
 * @typeParam V - The generic type parameter `V` can be any [valid AssemblyScript type](https://docs.assemblyscript.org/basics/types).
 *
 * MISC:
 *
 * Original code from Near (https://github.com/near/near-sdk-as/blob/master/sdk-core/assembly/collections/persistentMap.ts)
 */
export class PersistentMap<K, V> {
  private _elementPrefix: string;
  private _size: usize;

  /**
   * Creates or restores a persistent map with a given storage prefix.
   * Always use a unique storage prefix for different collections.
   *
   * Example
   *
   * ```ts
   * let map = new PersistentMap<string, string>("m") // note the prefix must be unique (per Massa account)
   * ```
   * @param prefix - A prefix to use for every key of this map.
   */
  constructor(prefix: string) {
    this._elementPrefix = prefix + _KEY_ELEMENT_SUFFIX;
    this._size = 0;
  }

  /**
   * @param key - Search key.
   * @returns An internal string key for a given key of type K.
   */
  private _key(key: K): StaticArray<u8> {
    // @ts-ignore: TODO: Add interface that forces all K types to have toString
    return stringToBytes(this._elementPrefix + key.toString());
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
   * @param key - Key to check.
   * @returns True if the given key present in the map.
   */
  contains(key: K): bool {
    return Storage.has(this._key(key));
  }

  /**
   * Returns the map size
   *
   * @example
   * ```ts
   * let map = new PersistentMap<string, string> ("m")
   *
   * map.size()
   * ```
   * @returns the map size
   */
  size(): usize {
    return this._size;
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
   * @param key - Key to remove.
   */
  delete(key: K): void {
    Storage.del(this._key(key));
    this._decreaseSize();
  }

  /**
   * Increases the internal map size counter
   * @param key - Key to remove.
   */
  _increaseSize(key: K): void {
    if (!this.contains(key)) {
      this._size += 1;
    }
  }

  /**
   * Decreases the internal map size counter
   */
  _decreaseSize(): void {
    if (this._size > 0) {
      this._size -= 1;
    }
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
   * @param key - Key of the element.
   * @param defaultValue - The default value if the key is not present.
   * @returns Value for the given key or the default value.
   */
  get(key: K, defaultValue: V | null = null): V | null {
    if (!this.contains(key)) {
      return defaultValue;
    }
    if (isString<V>()) {
      // @ts-ignore
      return bytesToString(Storage.get(this._key(key)));
    } else if (isInteger<V>()) {
      // @ts-ignore
      return bytesToI64(Storage.get(this._key(key)));
    } else if (isFloat<V>()) {
      // @ts-ignore
      return bytesToF64(Storage.get(this._key(key)));
    } else if (isBoolean<V>()) {
      // @ts-ignore
      return byteToBool(Storage.get(this._key(key)));
    } else if (idof<V>() == idof<StaticArray<u8>>()) {
      return Storage.get(this._key(key));
    } else if (isArrayLike<V>()) {
      // @ts-ignore
      return wrapStaticArray(Storage.get(this._key(key)));
    } else if (defaultValue instanceof Serializable) {
      const res = defaultValue.deserialize(Storage.get(this._key(key)));
      if (res.isOk()) {
        return defaultValue;
      } else {
        return null;
      }
    } else {
      // @ts-ignore
      return null;
    }
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
   * @param key - Key of the element.
   * @returns Value for the given key or the default value.
   */
  getSome(key: K, defaultValue: V | null = null): Result<V> {
    if (!this.contains(key)) {
      return new Result(<V>defaultValue, 'key not found');
    }

    const res = this.get(key, defaultValue);
    return new Result(<V>res);
  }

  /**
   * @example
   * ```ts
   * let map = new PersistentMap<string, string>("m")
   *
   * map.set("hello", "world")
   * ```
   *
   * Sets the new value for the given key.
   * @param key - Key of the element.
   * @param value - The new value of the element.
   */
  set(key: K, value: V): Result<usize> {
    // check for map size won't overflow
    if (this._size >= Usize.MAX_VALUE) {
      return new Result(this.size(), 'map size overflow');
    }

    this._increaseSize(key);

    if (isString<V>()) {
      Storage.set(this._key(key), stringToBytes(value as string));
    } else if (isInteger<V>()) {
      Storage.set(this._key(key), i64ToBytes(value as i64));
    } else if (isFloat<V>()) {
      Storage.set(this._key(key), f64ToBytes(value as f64));
    } else if (isBoolean<V>()) {
      Storage.set(this._key(key), boolToByte(value as boolean));
    } else if (value instanceof StaticArray<u8>) {
      Storage.set(this._key(key), value);
    } else if (isArrayLike<V>()) {
      Storage.set(this._key(key), unwrapStaticArray(value as Uint8Array));
    } else if (value instanceof Serializable) {
      Storage.set(this._key(key), value.serialize());
    } else {
      // @ts-ignore
      Storage.set(this._key(key), value.toString());
    }

    return new Result(this.size());
  }
}
