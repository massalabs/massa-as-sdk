import {Valider} from './valider';
import {ByteArray} from './byteArray';

/**
 * Monetary unit used to express a value.
 *
 * The minor unit of a currency, as described in the ISO 4217 standard,
 * is the maximal size of the fractional part that can be used
 * to describe the value when in a decimal form.
 *
 * For instance, US dollar has a minor unit of 2. This means that value
 * in US dollar must be express with two digits after the decimal separator
 * like in the following: 10.34
 * This can be done with the following instanciation:
 *
 * const dollar = new Currency("dollar", 2);
 */
export class Currency implements Valider {
  _isValid: bool;
  _minorUnit: u8;
  _name: string;

  /**
   * Creates a new instance of Currency.
   *
   * @param {string} name - name of the currency.
   * @param {u8} unit - minor unit of the currency.
   * @param {bool} isValid - is the instanciate object a valid currency ?
   */
  constructor(name: string = '', unit: u8 = 0, isValid: bool = true) {
    this._minorUnit = unit;
    this._name = name;
    this._isValid = isValid;
  }

  /**
   * Returns the size of the fractional part.
   *
   * @return {u8} Size in number of digits
   */
  minorUnit(): u8 {
    return this._minorUnit;
  }

  /**
   * Returns the name the currency.
   *
   * @return {string} Currency name.
   */
  name(): string {
    return this._name;
  }

  /**
   * Returns an invalid currency
   *
   * @return {Currency}
   */
  static invalid(): Currency {
    return new Currency('', 0, false);
  }

  /**
   * Returns if the Amount is still valid.
   * @return {bool}
   */
  isValid(): bool {
    return this._isValid;
  }

  /**
   * Returns the offset of the next element after having parsed an address from a string segment.
   *
   * The string segment can contains more thant on serialized element.
   *
   * @param {string} bs
   * @param {i32} begin
   * @return {i32}
   */
  fromStringSegment(bs: string, begin: i32 = 0): i32 {
    const length = u8(bs.codePointAt(begin));
    const c = Currency.fromByteString(bs.slice(begin + 1, begin + length + 1));
    this._name = c._name;
    this._minorUnit = c._minorUnit;
    this._isValid = c._isValid;
    return begin + length + 1;
  }

  /**
   * Returns a string segment.
   *
   * The string segment can be concatenated with others to serialize multiple elements.
   *
   * @return {string}
   */
  toStringSegment(): string {
    const bs = this.toByteString();
    return String.fromCharCode(u8(bs.length)).concat(bs);
  }

  /**
   * Returns a Currency from a byte string.
   *
   * Format is:
   * - 1 byte for minor unit
   * - variable for name
   *
   *
   * @param {string} bs - Byte string
   *
   * @return {Currency}
   */
  static fromByteString(bs: string): Currency {
    const a = ByteArray.fromByteString(bs);

    return this.fromByteArray(a);
  }

  /**
   * Serializes to byte string.
   * @return {string}
   */
  toByteString(): string {
    return this.toByteArray().toByteString();
  }

  /**
   * Returns a Currency from an Uint8Array.
   *
   * Format is:
   * - 1 byte for minor unit
   * - variable for name
   *
   *
   * @param {string} a
   *
   * @return {Currency}
   */
  static fromByteArray(a: Uint8Array): Currency {
    if (a.length < 2) {
      return Currency.invalid();
    }

    const minorUnit = a[0];
    const name = ByteArray.fromUint8Array(a.subarray(1)).toByteString();

    return new Currency(name, minorUnit);
  }

  /**
   * Serializes to ByteArray.
   * @return {ByteArray}
   */
  toByteArray(): ByteArray {
    if (!this.isValid) {
      return new ByteArray(0);
    }

    const ba = ByteArray.fromU8(this._minorUnit);

    return ba.concat(ByteArray.fromByteString(this._name));
  }

  /**
   * Checks if both currencies are the same.
   *
   * @param {Currency} other
   * @return {boolean}
   */
  @operator('==')
  equals(other: Currency): boolean {
    if (!this._isValid || !other.isValid()) {
      return false;
    }

    return this._minorUnit == other.minorUnit() && this._name == other.name();
  }

  /**
   * Checks if both currencies are different.
   *
   * @param {Currency} other
   * @return {boolean}
   */
  @operator('!=')
  notEqual(other: Currency): boolean {
    return !(this == other);
  }
}
