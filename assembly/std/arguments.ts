import {Address} from './address';
import {encode, decode} from './base64';

/**
 * Args for remote function call.
 *
 * This class can serialize assembly script native types into bytes, in order to
 * make smart-contract function call easier.
 *
 * In a smart-contract exposed function, use this class to deserialize the string
 * argument, using the `next...` methods.
 *
 * In a smart-contract, to call another smart-contract function, use this class
 * to serialize the arguments you want to pass to the smart-contract function
 * call.
 *
 */
export class Args {
  private offset: i64 = 0;
  private serialized: Uint8Array = new Uint8Array(0);

  /**
   *
   * @param {string} serialized
   */
  constructor(serialized: string = '') {
    this.serialized = decode(serialized);
  }

  /**
   * Returns the serialized string to pass to CallSC.
   *
   * @return {string} the serialized string
   */
  serialize(): string {
    return encode(this.serialized);
  }

  // getters

  /**
   * Returns the deserialized address.
   *
   * @return {Address} the address
   */
  nextAddress(): Address {
    const length = this.nextU32();
    let address = Address.fromByteArray(
      this.serialized.slice(this.offset as i32, (this.offset as i32) + length),
    );
    this.offset += length;
    return address;
  }

  /**
   * Returns the deserialized string.
   *
   * @return {string} the string
   */
  nextString(): string {
    const length = this.nextU32();
    let offset: i32 = this.offset as i32;
    const end = offset + length;
    const result = this.serialized.slice(offset, end);
    this.offset = end;
    return this.toByteString(result);
  }

  /**
   * Returns the deserialized Uint8Array.
   *
   * @return {Uint8Array}
   */
  nextUint8Array(): Uint8Array {
    const length = this.serialized[this.offset as i32];
    let byteArray = this.serialized.slice(
      (this.offset as i32) + 1,
      (this.offset as i32) + length + 1,
    );
    this.offset += length + 1;
    return byteArray;
  }

  /**
   * Returns the deserialized number as u64.
   *
   * @return {u64}
   */
  nextU64(): u64 {
    const value = this.toU64(this.serialized, this.offset as u8);
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as i64.
   *
   * @return {i64}
   */
  nextI64(): i64 {
    const value = changetype<i64>(
      this.toU64(this.serialized, this.offset as u8),
    );
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as f64.
   *
   * @return {f64}
   */
  nextF64(): f64 {
    const value = this.toF64(this.serialized, this.offset as u8);
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as f32.
   *
   * @return {f32}
   */
  nextF32(): f32 {
    const value = this.toF32(this.serialized, this.offset as u8);
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Returns the deserialized number as u32.
   *
   * @return {u32}
   */
  nextU32(): u32 {
    const value = this.toU32(this.serialized, this.offset as u8);
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Returns the deserialized number as i32.
   *
   * @return {i32}
   */
  nextI32(): i32 {
    const value = changetype<i32>(
      this.toU32(this.serialized, this.offset as u8),
    );
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Internal function to concat to Uint8Array.
   *
   * @param {Uint8Array} a first array to concat
   * @param {Uint8Array} b second array to concat
   *
   * @return {Uint8Array} the concatenated array
   */
  private concatArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    var c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }

  // Setter

  /**
   * Adds an argument to the serialized byte string if the argument is an
   * instance of a handled type (String of u32.MAX_VALUE characters maximum,
   * Address, u32, i32, u64, i64).
   *
   * @param {T} arg the argument to add
   *
   * @return {Args} the modified Arg instance
   */
  add<T>(arg: T): Args {
    if (arg instanceof Address) {
      let str = arg.toByteString();
      this.add<u32>(str.length);
      this.serialized = this.concatArrays(this.serialized, arg.toByteArray());
    } else if (arg instanceof String) {
      const str: string = arg.toString();
      this.add<u32>(str.length);
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromByteString(arg as string),
      );
    } else if (arg instanceof Uint8Array) {
      let length = new Uint8Array(1);
      length[0] = arg.length;
      this.serialized = this.concatArrays(
        this.concatArrays(this.serialized, length),
        arg,
      );
    } else if (arg instanceof u32) {
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromU32(changetype<u32>(arg)),
      );
    } else if (arg instanceof i64) {
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromU64(changetype<u64>(arg)),
      );
    } else if (arg instanceof u64) {
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromU64(changetype<u64>(arg)),
      );
    } else if (arg instanceof f32) {
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromF32(changetype<f32>(arg)),
      );
    } else if (arg instanceof f64) {
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromF64(changetype<f64>(arg)),
      );
    } else if (arg instanceof i32 || typeof arg == 'number') {
      // doing this `const one = 1;`, variable one is instance of i32
      // and typeof number
      this.serialized = this.concatArrays(
        this.serialized,
        this.fromU32(changetype<i32>(arg)),
      );
    }
    return this;
  }

  // Utils

  /**
   * Converts a string into a byte array.
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
   * Converts a byte array in a string.
   *
   * @param {Uint8Array} byteArray the byte array to convert
   *
   * @return {string}
   */
  private toByteString(byteArray: Uint8Array): string {
    let byteString = '';
    for (let i = 0; i < byteArray.length; i++) {
      byteString += String.fromCharCode(byteArray[i]);
    }
    return byteString;
  }

  /**
   * Converts a f64 in a bytearray.
   *
   * @param {f64} number the number to convert
   *
   * @return {Uint8Array} the converted bytearray
   */
  private fromF64(number: f64): Uint8Array {
    return this.fromU64(bswap<u64>(reinterpret<u64>(number)));
  }

  /**
   * Converts a f32 in a bytearray.
   *
   * @param {f32} number the number to convert
   *
   * @return {Uint8Array} the converted bytearray
   */
  private fromF32(number: f32): Uint8Array {
    return this.fromU32(bswap<u32>(reinterpret<u32>(number)));
  }

  /**
   * Converts a u64 in a bytearray.
   *
   * @param {u64} number the number to convert
   *
   * @return {Uint8Array} the converted bytearray
   */
  private fromU64(number: u64): Uint8Array {
    let byteArray = new Uint8Array(8);
    let firstPart: u32 = (number >> 32) as u32;
    byteArray.set(this.fromU32(firstPart), 4);
    byteArray.set(this.fromU32(number as u32));
    return byteArray;
  }

  /**
   * Converts a u32 in a bytearray.
   *
   * @param {u32} number the number to convert
   *
   * @return {Uint8Array} the converted bytearray
   */
  private fromU32(number: u32): Uint8Array {
    const byteArray = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      byteArray[i] = u8(number >> (i * 8));
    }
    return byteArray;
  }

  /**
   * Converts a byte array into a f64.
   *
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {f64}
   */
  private toF64(byteArray: Uint8Array, offset: u8 = 0): f64 {
    if (byteArray.length - offset < 8) {
      return <f64>NaN;
    }

    return reinterpret<f64>(bswap<u64>(this.toU64(byteArray, offset)));
  }

  /**
   * Converts a byte array into a f32.
   *
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {f32}
   */
  private toF32(byteArray: Uint8Array, offset: u8 = 0): f32 {
    if (byteArray.length - offset < 4) {
      return <f32>NaN;
    }

    return reinterpret<f32>(bswap<u32>(this.toU32(byteArray, offset)));
  }

  /**
   * Converts a byte array into a u64.
   *
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {u64}
   */
  private toU64(byteArray: Uint8Array, offset: u8 = 0): u64 {
    if (byteArray.length - offset < sizeof<u64>()) {
      return <u64>NaN;
    }

    let x: u64 = 0;
    x = (x | this.toU32(byteArray, offset + 4)) << 32;
    x = x | this.toU32(byteArray, offset);
    return x;
  }

  /**
   * Converts a byte array into a u32.
   *
   * @param {Uint8Array} byteArray
   * @param {u8} offset
   * @return {u32}
   */
  private toU32(byteArray: Uint8Array, offset: u8 = 0): u32 {
    if (byteArray.length - offset < sizeof<u32>()) {
      return <u32>NaN;
    }

    let x: u32 = 0;
    for (let i = 3; i >= 1; --i) {
      x = (x | byteArray[offset + i]) << 8;
    }
    x = x | byteArray[offset];
    return x;
  }
}
