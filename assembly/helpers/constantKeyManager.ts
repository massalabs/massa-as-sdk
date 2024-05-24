import { Args, Result } from '@massalabs/as-types';
import { KeyIncrementer, KeySequenceManager } from './keyIncrementer';
import { Storage } from '../std';

/**
 * Manages a constant value in storage.
 *
 * @typeParam TValue - The type of the value stored.
 * @typeParam TKey - The type of the key used to store the value.
 * @typeParam TArray - When value is an array of serializable, the underlying serializable type.
 */
export class ConstantManager<TValue, TKey = u8, TArray = void> {
  public key: StaticArray<u8>;

  constructor(manager: KeySequenceManager = new KeyIncrementer<TKey>(0)) {
    this.key = manager.nextKey();
  }

  /**
   * Retrieves the value from storage and panics in case of failure.
   *
   * @returns the value stored.
   * @throws if the key is not found in storage.
   * @throws if the value is not found in storage.
   */
  public mustValue(): TValue {
    return new Args(Storage.get(this.key)).next<TValue, TArray>().unwrap();
  }

  /**
   * Retrieves the value from storage and returns a result.
   *
   * @returns the value stored wrapped in a result.
   */
  public tryValue(): Result<TValue> {
    if (!Storage.has(this.key)) {
      if (isManaged<TValue>()) {
        return new Result<TValue>(instantiate<TValue>(), 'Key not found');
      }
      return new Result<TValue>(0, 'Key not found');
    }

    return new Args(Storage.get(this.key)).next<TValue, TArray>();
  }

  /**
   * Sets the value in storage.
   *
   * @param value - The value to store. Must be an A
   */
  public set(value: TValue): void {
    Storage.set(this.key, new Args().add<TValue, TArray>(value).serialize());
  }
}
