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
   * This method is used to serialize an Address object into a byte array,
   * which can be passed as an argument to another smart contract's method,
   * or stored in persistent storage.
   *
   * @privateRemarks
   * Addresses base58check encoded are not fixed-size, so the first bytes are the size as a
   * i32, then the address string is encoded.
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
   * @remarks
   * This method deserializes a byte array into an `Address` object.
   * Caller can test if the deserialization is successful by checking the
   * [Result](https://as-types.docs.massa.net/classes/Result.html) wrapping the offset value.
   * This offset can be used to identify where the next element starts in the byte array, if any.
   *
   * @privateRemarks
   * This method constructs a new instance of the `Args` class using the `data` and `offset` parameters.
   *
   * @param data - The byte string to deserialize.
   * @param offset - The offset of the current serialized address object in the byte array.
   *
   * @returns The offset of the next serialized object in the byte array wrapped in a `Result`.
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
   * @remarks
   * This method compares the string representation of the current `Address` object to another `Address`
   * object to determine if they are identical.
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
   * @remarks
   * This method compares the string representation of the current `Address` object to another `Address`
   * object to determine if they are different.
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
