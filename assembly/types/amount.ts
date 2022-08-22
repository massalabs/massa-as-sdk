import {Currency} from './currency';
import {Valider} from './valider';
import {ByteArray} from './byteArray';

/**
 * Value in currency to express an amount.
 *
 * For instance $10.34 will be instanciate as the following:
 *
 * const dollar = new Currency("dollar", 2);
 * const price = new Amount(1034, dollar);
 *
 * Note: When type is not an amount anymore due to calculation side effect,
 * _isValid flag is unset.
 *
 */
export class Amount implements Valider {
  _value: u64;
  _currency: Currency;
  _isValid: bool;

  /**
   * Creates a new Amount;
   *
   * @param {u64} value - Amount value.
   * @param {Currency} currency - Amount currency.
   * @param {bool} isValid - Is a valid currency
   */
  constructor(
      value: u64 = 0,
      currency: Currency = new Currency(),
      isValid: bool = true
  ) {
    this._value = value;
    this._currency = currency;
    this._isValid = isValid;
  }

  /**
   * Returns the value of the amount.
   *
   * @return {u64}
   */
  value(): u64 {
    return this._value;
  }

  /**
   * Returns the currency of the amount.
   *
   * @return {Currency}
   */
  currency(): Currency {
    return this._currency;
  }

  /**
   * Returns an invalid amount.
   * @return {Amount}
   */
  static invalid(): Amount {
    return new Amount(0, Currency.invalid(), false);
  }

  /**
   * Returns if the Amount is still valid.
   * @return {bool}
   */
  isValid(): bool {
    return this._isValid;
  }

  /**
   * Checks if both amounts currencies matches and
   * if both amounts are still valid.
   *
   * @param {Amount} a - Amount to check against.
   *
   * @return {bool}
   */
  private _matchAndAmounts(a: Amount): bool {
    return this._currency == a.currency() && this._isValid && a.isValid();
  }

  /**
   * Adds two amounts and return results in a new one.
   *
   * WARNING : return amount may be invalid. You shall verify isNot value.
   *
   * @param {Amount} a - Amout to add.
   *
   * @return {Amount}
   */
  add(a: Amount): Amount {
    if (!this._matchAndAmounts(a)) {
      return Amount.invalid();
    }

    const r = new Amount(this._value + a.value(), this._currency);

    return r.lessThan(a) ? Amount.invalid() : r;
  }

  /**
   * Substact given amount from existing one.
   *
   * @param {Amount} a - Amount to substract.
   *
   * @return {Amount}
   */
  substract(a: Amount): Amount {
    if (!this._matchAndAmounts(a) || this.lessThan(a)) {
      return Amount.invalid();
    }

    return new Amount(this._value - a.value(), this._currency);
  }

  /**
   * Check if existent amount is lower than given one.
   *
   * @param {Amount} a - Amount to check against.
   *
   * @return {bool}
   */
  @operator('<')
  lessThan(a: Amount): bool {
    return this._value < a.value();
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
    const c = Amount.fromByteString(bs.slice(begin + 1, begin + length + 1));
    this._value = c._value;
    this._currency = c._currency;
    this._isValid = c._isValid;
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
    const bs = this.toByteString();
    return String.fromCharCode(u8(bs.length)).concat(bs);
  }

  /**
   * Returns an Amount from a byte string.
   *
   * Format is:
   * - 8 bytes for value
   * - 2+ bytes for currency
   *
   * @param {string} bs - Byte string
   *
   * @return {Amount}
   */
  static fromByteString(bs: string): Amount {
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
   * Returns an Amount from a byte array.
   *
   * Format is:
   * - 8 bytes for value
   * - 2+ bytes for currency
   *
   * @param {string} a - Byte array
   *
   * @return {Amount}
   */
  static fromByteArray(a: Uint8Array): Amount {
    if (a.length < 10) {
      return Amount.invalid();
    }

    const value = ByteArray.fromUint8Array(a.subarray(0, 8)).toU64();
    const currency = Currency.fromByteArray(a.subarray(8));

    if (!currency.isValid()) {
      return Amount.invalid();
    }

    return new Amount(value, currency);
  }

  /**
   * Serialize to ByteArray.
   * @return {ByteArray}
   */
  toByteArray(): ByteArray {
    if (!this.isValid) {
      return new ByteArray(0);
    }

    const ba = ByteArray.fromU64(this._value);

    return ba.concat(this._currency.toByteArray());
  }

  /**
   * Tests if two amounts are identical.
   *
   * @param {Amount} other
   * @return {boolean}
   */
  @operator('==')
  equals(other: Amount): boolean {
    if (!this._isValid || !other.isValid()) {
      return false;
    }

    return this._currency == other.currency() && this._value == other.value();
  }

  /**
   * Tests if two amounts are different.
   *
   * @param {Amount} other
   * @return {boolean}
   */
  @operator('!=')
  notEqual(other: Amount): boolean {
    return !(this == other);
  }
}
