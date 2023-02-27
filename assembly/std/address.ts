import { Valider, Serializable, Args, Result } from '@massalabs/as-types';

/**
 * A Massa's blockchain address.
 *
 */
export class Address implements Valider, Serializable {
  /**
   * Creates a new Address;
   *
   * @param bs - Byte string.
   * @param isValid - default true
   */
  constructor(private _value: string = '', private _isValid: bool = true) {}

  /**
   * Returns if the Address is still valid.
   *
   * see https://github.com/massalabs/massa-sc-runtime/issues/142
   */
  isValid(): bool {
    return this._isValid;
  }

  /**
   * Serialize the address
   *
   * @remarks
   * Addresses are not fixed-size so the first bytes are the size as a i32, then the address string is encoded.
   *
   * @returns the bytes
   */
  serialize(): StaticArray<u8> {
    return new Args().add(this._value).serialize();
  }

  /**
   * Deserialize the address
   *
   * @param data - bytes
   * @param offset - `Args` instance current offset
   * @returns the new offset wrapped in a `Result`
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
   * Serialize to byte string.
   */
  toString(): string {
    return this._value;
  }

  /**
   * Tests if two addresses are identical.
   *
   * @param other - the address object to compare
   */
  @operator('==')
  equals(other: Address): boolean {
    return this._value == other.toString();
  }

  /**
   * Tests if two addresses are different.
   *
   * @param other - the address object to compare
   */
  @operator('!=')
  notEqual(other: Address): boolean {
    return !(this == other);
  }
}
