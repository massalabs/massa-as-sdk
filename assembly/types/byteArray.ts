/**
 * A simple array of bytes.
 */
export class ByteArray extends Uint8Array {
  /**
   * Convert a byte string to a byte array.
   * @param {string} byteString - Byte string
   *
   * @return {ByteArray}
   */
  static fromByteString(byteString: string): ByteArray {
    const self = new ByteArray(byteString.length);
    for (let i = 0; i < self.length; i++) {
      self[i] = u8(byteString.charCodeAt(i));
    }
    return self;
  }

  /**
   * Returns a byte string.
   *
   * @return {string}
   */
  toByteString(): string {
    let s = '';
    for (let i = 0; i < this.length; i++) {
      s += String.fromCharCode(this[i]);
    }
    return s;
  }

  /**
   * Convert a uint8 Array to a byte array.
   * @param {Uint8Array} array - Uint8 array
   *
   * @return {ByteArray}
   */
  static fromUint8Array(array: Uint8Array): ByteArray {
    return changetype<ByteArray>(array);
  }

  /**
   * Convert a byte to a byte array.
   * @param {u8} b - byte
   *
   * @return {ByteArray}
   */
  static fromU8(b: u8): ByteArray {
    const self = new ByteArray(1);
    self[0] = b;
    return self;
  }

  /**
   * Returns bytes in little-endian order.
   * @param {i32} i - integer
   *
   * @return {ByteArray}
   */
  static fromI32(i: i32): ByteArray {
    const self = new ByteArray(4);
    self[0] = i as u8;
    self[1] = (i >> 8) as u8;
    self[2] = (i >> 16) as u8;
    self[3] = (i >> 24) as u8;
    return self;
  }

  /**
   * Returns a int32
   *
   * @return {i32}
   */
  toI32(): i32 {
    if (this.length != 4) {
      return <i32>NaN;
    }

    let x: i32 = 0;
    x = (x | this[3]) << 8;
    x = (x | this[2]) << 8;
    x = (x | this[1]) << 8;
    x = x | this[0];
    return x;
  }

  /**
   * Returns bytes in little-endian order.
   * @param {u32} u - integer
   *
   * @return {ByteArray}
   */
  static fromU32(u: u32): ByteArray {
    const self = new ByteArray(4);
    self[0] = u as u8;
    self[1] = (u >> 8) as u8;
    self[2] = (u >> 16) as u8;
    self[3] = (u >> 24) as u8;
    return self;
  }

  /**
   * Returns a u32 from byte array
   *
   * @return {u32}
   */
  toU32(): u32 {
    if (this.length != 4) {
      return <u32>NaN;
    }

    let x: u32 = 0;
    x = (x | this[3]) << 8;
    x = (x | this[2]) << 8;
    x = (x | this[1]) << 8;
    x = x | this[0];
    return x;
  }

  /**
   * Returns bytes in little-endian order.
   * @param {i64} i - integer
   *
   * @return {ByteArray}
   */
  static fromI64(i: i64): ByteArray {
    const self = new ByteArray(8);
    self[0] = i as u8;
    self[1] = (i >> 8) as u8;
    self[2] = (i >> 16) as u8;
    self[3] = (i >> 24) as u8;
    self[4] = (i >> 32) as u8;
    self[5] = (i >> 40) as u8;
    self[6] = (i >> 48) as u8;
    self[7] = (i >> 56) as u8;
    return self;
  }

  /**
   * Returns a i64.
   *
   * @return {i64}
   */
  toI64(): i64 {
    if (this.length != 8) {
      return <i64>NaN;
    }

    let x: i64 = 0;
    x = (x | this[7]) << 8;
    x = (x | this[6]) << 8;
    x = (x | this[5]) << 8;
    x = (x | this[4]) << 8;
    x = (x | this[3]) << 8;
    x = (x | this[2]) << 8;
    x = (x | this[1]) << 8;
    x = x | this[0];
    return x;
  }

  /**
   * Returns bytes in little-endian order.
   * @param {u64} u - integer
   *
   * @return {ByteArray}
   */
  static fromU64(u: u64): ByteArray {
    const self = new ByteArray(8);
    self[0] = u as u8;
    self[1] = (u >> 8) as u8;
    self[2] = (u >> 16) as u8;
    self[3] = (u >> 24) as u8;
    self[4] = (u >> 32) as u8;
    self[5] = (u >> 40) as u8;
    self[6] = (u >> 48) as u8;
    self[7] = (u >> 56) as u8;
    return self;
  }

  /**
   * Returns a u64.
   *
   * @return {u64}
   */
  toU64(): u64 {
    if (this.length != 8) {
      return <u64>NaN;
    }
    let x: u64 = 0;
    x = (x | this[7]) << 8;
    x = (x | this[6]) << 8;
    x = (x | this[5]) << 8;
    x = (x | this[4]) << 8;
    x = (x | this[3]) << 8;
    x = (x | this[2]) << 8;
    x = (x | this[1]) << 8;
    x = x | this[0];
    return x;
  }

  /**
   * Returns a new byte array from the concatenation of the values
   * of the two byte arrays.
   *
   * @param {ByteArray} ba
   * @return {ByteArray}
   */
  concat(ba: ByteArray): ByteArray {
    const n = new ByteArray(this.length + ba.length);
    n.set(this, 0);
    n.set(ba, this.length);
    return n;
  }

  /**
   * Tests if two ByteArray have identical bytes.
   *
   * @param {ByteArray} other
   * @return {boolean}
   */
  @operator('==')
  equals(other: ByteArray): boolean {
    if (this.length != other.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (this[i] != other[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Tests if two ByteArray have different bytes.
   *
   * @param {ByteArray} other
   * @return {boolean}
   */
  @operator('!=')
  notEqual(other: ByteArray): boolean {
    return !(this == other);
  }
}
