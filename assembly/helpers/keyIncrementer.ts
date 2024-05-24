import { Args } from '@massalabs/as-types';
/**
 * Manages key sequences for storage.
 */
export interface KeySequenceManager {
  nextKey(): StaticArray<u8>;
}

/**
 * A key sequence manager that simply increments a counter each time a key is requested.
 *
 * @typeParam T - The type of the counter, defaults to `u8`.
 */
export class KeyIncrementer<T = u8> implements KeySequenceManager {
  constructor(public counter: T = 0) {}

  /**
   * Generates the next key in the sequence.
   *
   * @remarks
   * The `Args` class is used to serialize the counter into a key. Ideally, this serialization should
   * be done outside of the `Args` object as we are allocating an object simply to get a proper serialization
   * of the counter.
   *
   * @returns A unique storage key.
   */
  @inline
  public nextKey(): StaticArray<u8> {
    return new Args().add(this.counter++).serialize();
  }
}
