import {
  Valider,
  Serializable,
  stringToBytes,
  bytesToString,
  i32ToBytes,
} from '@massalabs/as-types';

/**
 * A Massa's blockchain address.
 *
 */
export class Address implements Valider, Serializable<Address> {
  _value: string;
  _isValid: bool;

  /**
   * Creates a new Address;
   *
   * @param bs - Byte string.
   * @param isValid - default true
   */
  constructor(bs: string = '', isValid: bool = true) {
    this._value = bs;
    this._isValid = isValid;
  }

  /**
   * Returns if the Address is still valid.
   *
   * see https://github.com/massalabs/massa-sc-runtime/issues/142
   */
  isValid(): bool {
    return this._isValid;
  }

  serialize(): StaticArray<u8> {
    return i32ToBytes(this._value.length).concat(stringToBytes(this._value));
  }

  deserialize(data: StaticArray<u8>, offset: i32): i32 {
    const length = data[offset];
    const start = offset + sizeof<i32>();
    const end = start + length;
    this._value = bytesToString(
      changetype<StaticArray<u8>>(data.slice(start, end).dataStart),
    );
    return end;
  }

  /**
   * Returns an Address from a byte string.
   *
   * @param bs - Byte string
   */
  static fromString(bs: string): Address {
    return new Address(bs);
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
