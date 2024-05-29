import { Args, Result } from '@massalabs/as-types';
import { KeyIncrementer, KeySequenceManager } from './keyIncrementer';
import { Storage } from '../std';

/**
 * Manages a Map in storage.
 *
 * @typeParam TValue - The type of the value stored.
 * @typeParam TKey - The type of the key used to store the value.
 * @typeParam TKeySequenceManager - The type of the key sequence manager.
 * @typeParam TArray - When value is an array of serializable, the underlying serializable type.
 */
export class MapManager<TKey, TValue, TKeySequenceManager = u8, TArray = void> {
  public keyPrefix: StaticArray<u8>;

  constructor(
    manager: KeySequenceManager = new KeyIncrementer<TKeySequenceManager>(0),
  ) {
    this.keyPrefix = manager.nextKey();
  }

  @inline
  private storageKey(key: TKey): StaticArray<u8> {
    return new Args(this.keyPrefix).add(key).serialize();
  }

  /**
   * Retrieves the value from storage and panics in case of failure.
   *
   * @returns the value stored.
   * @throws if the key is not found in storage.
   * @throws if the value is not found in storage.
   */
  public mustValue(key: TKey): TValue {
    return new Args(Storage.get(this.storageKey(key)))
      .next<TValue, TArray>()
      .unwrap();
  }

  /**
   * Retrieves the value from storage and returns a result.
   *
   * @returns the value stored wrapped in a result.
   */
  public value(key: TKey): Result<TValue> {
    const storageKey = this.storageKey(key);
    if (!Storage.has(storageKey)) {
      if (isManaged<TValue>()) {
        return new Result<TValue>(instantiate<TValue>(), 'Key not found');
      }
      return new Result<TValue>(0, 'Key not found');
    }

    return new Args(Storage.get(storageKey)).next<TValue, TArray>();
  }

  /**
   * Sets the value in storage.
   *
   * @param value - The value to store. Must be an A
   */
  public set(key: TKey, value: TValue): void {
    Storage.set(
      this.storageKey(key),
      new Args().add<TValue, TArray>(value).serialize(),
    );
  }
}
