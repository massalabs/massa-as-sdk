import { Valider, Serializable, Args, Result } from '@massalabs/as-types';

/**
 * Represents a Massa blockchain address.
 */
export class Address implements Valider, Serializable {
  /**
   * Creates a new Address;
   *
   * @param _value - A byte string that represents the address data.
   * @param _isValid - Defaults to `true`.
   */
  constructor(private _value: string = '', private _isValid: bool = true) {}

  /**
   * Returns whether the Address is still valid.
   *
   * @returns A boolean value indicating whether the address is still valid.
   *
   * @see https://github.com/massalabs/massa-sc-runtime/issues/142
   */
  isValid(): bool {
    return this._isValid;
  }

  /**
   * Serialize the address.
   *
   * @remarks
   * Addresses are not fixed-size, so the first bytes are the size as a `i32`, then the address string is encoded.
   *
   * TODO: explain why we need tis method
   *
   * @returns The serialized byte string of the address.
   */
  serialize(): StaticArray<u8> {
    return new Args().add(this._value).serialize();
  }

  /**
   * Deserialize the address.
   *
   * TODO: explain why we need this method
   *
   * @param data - The byte string to deserialize.
   * @param offset - The current offset of the `Args` instance.
   *
   * @returns The new offset wrapped in a `Result`.
   */
  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);
    const result = args.nextString();
    if (result.isErr()) {
      return new Result(0, "Can't deserialize address.");
    }
    this._value = result.unwrap();
    return new Result(args.offset);
  }

  /**
   * Convert the address to a string.
   *
   * @returns A string representation of the address.
   */
  toString(): string {
    return this._value;
  }

  /**
   * Tests if two addresses are identical.
   *
   * @param address - The address object to compare.
   *
   * @returns `true` if the addresses are identical, `false` otherwise.
   */

  @operator('==')
  equals(address: Address): boolean {
    return this._value == address.toString();
  }

  /**
   * Tests if two addresses are different.
   *
   * @param address - The address object to compare.
   *
   * @returns `true` if the addresses are different, `false` otherwise.
   */
  @operator('!=')
  notEqual(address: Address): boolean {
    return !(this == address);
  }
}
