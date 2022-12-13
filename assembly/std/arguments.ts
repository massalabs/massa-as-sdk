import {Address} from './address';
import {
  fromBytesUTF8,
  fromF32,
  fromF64,
  fromU32,
  fromU64,
  toBytesUTF8,
  toF32,
  toF64,
  toU32,
  toU64,
} from './index';
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
  private offset: i32 = 0;
  private serialized: Uint8Array = new Uint8Array(0);

  /**
   *
   * @param {string} serialized
   */
  constructor(serialized: StaticArray<u8> = new StaticArray<u8>(0)) {
    this.serialized = new Uint8Array(serialized.length);
    for (let i = 0; i < serialized.length; i++) {
      this.serialized[i] = serialized[i];
    }
  }

  /**
   * Returns the serialized string to pass to CallSC.
   *
   * @return {string} the serialized string
   */
  serialize(): StaticArray<u8> {
    let array: Array<u8> = new Array(this.serialized.length);
    for (let i = 0; i < this.serialized.length; i++) {
      array[i] = this.serialized[i];
    }
    return StaticArray.fromArray(array);
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
      this.serialized.slice(this.offset, this.offset + length),
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
    let offset = this.offset;
    const end = offset + length;
    const result = this.serialized.slice(offset, end);
    this.offset = end;
    return fromBytesUTF8(result);
  }

  /**
   * Returns the deserialized Uint8Array.
   *
   * @return {Uint8Array}
   */
  nextUint8Array(): Uint8Array {
    const length = this.nextU32();
    let byteArray = this.serialized.slice(this.offset, this.offset + length);
    this.offset += length;
    return byteArray;
  }

  /**
   * Returns the deserialized number as u64.
   *
   * @return {u64}
   */
  nextU64(): u64 {
    const value = toU64(this.serialized, this.offset as u8);
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as i64.
   *
   * @return {i64}
   */
  nextI64(): i64 {
    const value = changetype<i64>(toU64(this.serialized, this.offset as u8));
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as f64.
   *
   * @return {f64}
   */
  nextF64(): f64 {
    const value = toF64(this.serialized, this.offset as u8);
    this.offset += sizeof<u64>();
    return value;
  }

  /**
   * Returns the deserialized number as f32.
   *
   * @return {f32}
   */
  nextF32(): f32 {
    const value = toF32(this.serialized, this.offset as u8);
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Returns the deserialized number as u32.
   *
   * @return {u32}
   */
  nextU32(): u32 {
    const value = toU32(this.serialized, this.offset as u8);
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Returns the deserialized number as i32.
   *
   * @return {i32}
   */
  nextI32(): i32 {
    const value = changetype<i32>(toU32(this.serialized, this.offset as u8));
    this.offset += sizeof<u32>();
    return value;
  }

  /**
   * Returns the deserialized boolean
   *
   * @return {bool}
   */
  nextBool(): bool {
    return this.serialized[this.offset++] === 0x01;
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
    if (arg instanceof bool) {
      const value = new Uint8Array(1);
      value[0] = u8(arg === true);
      this.serialized = this.concatArrays(this.serialized, value);
    } else if (arg instanceof Address) {
      let str = arg.toByteString();
      this.add<u32>(str.length);
      this.serialized = this.concatArrays(this.serialized, arg.toByteArray());
    } else if (arg instanceof String) {
      const str: string = arg.toString();
      this.add<u32>(str.length);
      this.serialized = this.concatArrays(
        this.serialized,
        toBytesUTF8(arg as string),
      );
    } else if (arg instanceof Uint8Array) {
      this.add<u32>(arg.length);
      this.serialized = this.concatArrays(this.serialized, arg);
    } else if (arg instanceof u32) {
      this.serialized = this.concatArrays(
        this.serialized,
        fromU32(changetype<u32>(arg)),
      );
    } else if (arg instanceof i64) {
      this.serialized = this.concatArrays(
        this.serialized,
        fromU64(changetype<u64>(arg)),
      );
    } else if (arg instanceof u64) {
      this.serialized = this.concatArrays(
        this.serialized,
        fromU64(changetype<u64>(arg)),
      );
    } else if (arg instanceof f32) {
      this.serialized = this.concatArrays(
        this.serialized,
        fromF32(changetype<f32>(arg)),
      );
    } else if (arg instanceof f64) {
      this.serialized = this.concatArrays(
        this.serialized,
        fromF64(changetype<f64>(arg)),
      );
    } else if (arg instanceof i32 || typeof arg == 'number') {
      // doing this `const one = 1;`, variable one is instance of i32
      // and typeof number
      this.serialized = this.concatArrays(
        this.serialized,
        fromU32(changetype<i32>(arg)),
      );
    }
    return this;
  }

  // Utils

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
}
