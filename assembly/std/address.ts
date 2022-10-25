import {Valider, ByteArray} from '@massalabs/as/assembly';

/**
 * A Massa's blockchain address.
 *
 */
export class Address implements Valider {
  _value: string;
  _isValid: bool;

  /**
   * Creates a new Address;
   *
   * @param {string} bs - Byte string.
   * @param {bool} isValid - default true
   */
  constructor(bs: string = '', isValid: bool = true) {
    this._value = bs;
    this._isValid = isValid;
  }

  /**
   * Returns if the Address is still valid.
   *
   * see https://github.com/massalabs/massa-sc-runtime/issues/142
   *
   * @return {bool}
   */
  isValid(): bool {
    return this._isValid;
  }

  /**
   * Returns the offset of the next element after having parsed
   * an address from a string segment.
   *
   * The string segment can contains more thant on serialized element.
   *
   * @param {string} bs
   * @param {i32} begin
   * @return {i32}
   */
  fromStringSegment(bs: string, begin: i32 = 0): i32 {
    const length = u8(bs.codePointAt(begin));
    // return length;
    this._value = Address.fromByteString(
      bs.slice(begin + 1, begin + length + 1),
    ).toByteString();
    return begin + length + 1;
  }

  /**
   * Returns a string segment.
   *
   * The string segment can be concatenated with others
   * to serialize multiple elements.
   *
   * @return {string}
   */
  toStringSegment(): string {
    return String.fromCharCode(u8(this._value.length)).concat(
      this.toByteString(),
    );
  }

  /**
   * Returns an Address from a byte string.
   *
   * @param {string} bs - Byte string
   *
   * @return {Address}
   */
  static fromByteString(bs: string): Address {
    return new Address(bs);
  }

  /**
   * Serialize to byte string.
   *
   * @return {string}
   */
  toByteString(): string {
    return this._value;
  }

  /**
   * Returns an Address from a byte array.
   *
   * @param {string} a - Byte array
   *
   * @return {Address}
   */
  static fromByteArray(a: Uint8Array): Address {
    return this.fromByteString(ByteArray.fromUint8Array(a).toByteString());
  }

  /**
   * Serialize to ByteArray.
   * @return {ByteArray}
   */
  toByteArray(): ByteArray {
    return ByteArray.fromByteString(this._value);
  }

  /**
   * Tests if two adresses are identical.
   *
   * @param {Address} other
   * @return {boolean}
   */
  @operator('==')
  equals(other: Address): boolean {
    return this._value == other.toByteString();
  }

  /**
   * Tests if two addresses are different.
   *
   * @param {Address} other
   * @return {boolean}
   */
  @operator('!=')
  notEqual(other: Address): boolean {
    return !(this == other);
  }
}
