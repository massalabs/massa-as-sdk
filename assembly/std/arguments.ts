import {Address} from './address';
import {ByteArray} from '@massalabs/as/assembly/byteArray';

/**
 * Args for remote function call
 */
export class Args {
  private offset: i64 = 0;
  private argsString: string = '';

  /**
   *
   * @param {string} argsString
   * @param {Array<string>} types
   */
  constructor(argsString: string = '') {
    this.argsString = argsString;
  }

  /**
   *
   * @return {string} the serialized string
   */
  serialize(): string {
    return this.argsString;
  }

  // getters

  /**
   *
   * @return {Address} the address
   */
  nextAddress(): Address {
    const address = new Address();
    this.offset = address.fromStringSegment(
      this.argsString,
      this.offset as i32,
    );
    return address;
  }

  /**
   *
   * @return {string} the string
   */
  nextString(): string {
    let offset: i32 = this.offset as i32;
    const length = u8(this.argsString.codePointAt(offset));
    const end = offset + length + 1;
    const result = this.argsString.slice(offset + 1, end);
    this.offset = end;
    return result;
  }

  /**
   * @return {u64}
   */
  nextU64(): u64 {
    const byteArray = this.fromByteString(this.argsString);
    const amount = this.toU64(byteArray, this.offset as u8);
    this.offset += 8;
    return amount;
  }

  /**
   * @return {i64}
   */
  nextI64(): i64 {
    const byteArray = this.fromByteString(this.argsString);
    const amount = this.toI64(byteArray, this.offset as u8);
    this.offset += 8;
    return amount;
  }

  // Setter

  /**
   *
   * @param {T} arg the argument to add
   *
   * @return {Args} the modified Arg instance
   */
  add<T>(arg: T): Args {
    if (arg instanceof Address) {
      this.argsString = this.argsString.concat(arg.toStringSegment());
    } else if (arg instanceof String) {
      const str: string = arg.toString();
      this.argsString = this.argsString.concat(
        String.fromCharCode(u8(str.length)).concat(str as string),
      );
    } else if (arg instanceof u64) {
      this.argsString = this.argsString.concat(
        ByteArray.fromU64(arg as u64).toByteString(),
      );
    } else if (arg instanceof i64 || typeof arg == 'number') {
      this.argsString = this.argsString.concat(
        ByteArray.fromI64(arg as i64).toByteString(),
      );
    }
    return this;
  }

  // Utils

  /**
   *
   * @param {string} byteString
   * @return {Uint8Array}
   */
  private fromByteString(byteString: string): Uint8Array {
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = u8(byteString.charCodeAt(i));
    }
    return byteArray;
  }

  /**
   *
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {u64}
   */
  private toU64(byteArray: Uint8Array, offset: u8 = 0): u64 {
    if (byteArray.length - offset < 8) {
      return <u64>NaN;
    }

    let x: u64 = 0;
    for (let i = 7; i >= 1; --i) {
      x = (x | byteArray[offset + i]) << 8;
    }
    x = x | byteArray[offset];
    return x;
  }

  /**
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {i64}
   */
  private toI64(byteArray: Uint8Array, offset: u8 = 0): i64 {
    if (byteArray.length - offset < 8) {
      return <i64>NaN;
    }

    let x: i64 = 0;
    for (let i = 7; i >= 1; --i) {
      x = (x | byteArray[offset + i]) << 8;
    }
    x = x | byteArray[offset];
    return x;
  }
}
