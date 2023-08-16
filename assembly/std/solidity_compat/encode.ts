import { u128, u256 } from 'as-bignum/assembly';
import { toBytes, stringToBytes } from '@massalabs/as-types';
import { Bytes4, Bytes32 } from './bytes';

// Emulate abi.encode
// Note: in order to add a class (a struct in Solidity) you need to add each field one by one
export class AbiEncode {
  private serialized: StaticArray<u8> = new StaticArray<u8>(0);
  constructor(serialized: StaticArray<u8> = []) {
    this.serialized = serialized;
  }

  serialize(): StaticArray<u8> {
    return this.serialized;
  }

  add<T>(arg: T): this {
    if (arg instanceof u8) {
      let arg32 = new StaticArray<u8>(32 - sizeof<T>()).concat(toBytes(arg));
      this.serialized = this.serialized.concat(arg32);
    } else if (arg instanceof u16 || arg instanceof u32 || arg instanceof u64) {
      let arg32 = new StaticArray<u8>(32 - sizeof<T>()).concat(
        toBytes(bswap(arg)),
      );
      this.serialized = this.serialized.concat(arg32);
    } else if (arg instanceof u128) {
      this.serialized = this.serialized.concat(arg.toStaticBytes(true));
    } else if (arg instanceof u256) {
      this.serialized = this.serialized.concat(arg.toStaticBytes(true));
    } else if (arg instanceof string) {
      let _arg = stringToBytes(arg);
      // Offset to string data?
      let offset: u32 = this.serialized.length + 32;
      let arg1 = new StaticArray<u8>(32 - sizeof<u32>()).concat(
        toBytes(bswap(offset)),
      );
      this.serialized = this.serialized.concat(arg1);
      // String as bytes length
      let strLen: u32 = _arg.length;
      let arg2 = new StaticArray<u8>(32 - sizeof<u32>()).concat(
        toBytes(bswap(strLen)),
      );
      this.serialized = this.serialized.concat(arg2);
      // String as bytes
      let chunk = i32(_arg.length / 32);
      if (_arg.length % 32 != 0) {
        chunk += 1;
      }
      for (let i = 0; i < chunk; i++) {
        let startOffset = i * 32;
        let endOffset = (i + 1) * 32;
        if (endOffset > _arg.length) {
          endOffset = _arg.length;
        }
        let _bytes = _arg.slice<StaticArray<u8>>(startOffset, endOffset);
        let b32 = new Bytes32().add(_bytes);
        this.serialized = this.serialized.concat(b32.serialize());
      }
    } else if (arg instanceof Bytes32) {
      this.serialized = this.serialized.concat(arg.serialize());
    } else {
      ERROR('[AbiEncode] Do not know how to serialize the given type');
    }
    return this;
  }
}

// Emulate abi.encodePacked
export class AbiEncodePacked {
  private _offset: i32 = 0;
  private serialized: StaticArray<u8> = new StaticArray<u8>(0);

  constructor(serialized: StaticArray<u8> = [], offset: i32 = 0) {
    this.serialized = serialized;
    this._offset = offset;
  }

  serialize(): StaticArray<u8> {
    return this.serialized;
  }

  add<T>(arg: T): this {
    if (arg instanceof u8) {
      this.serialized = this.serialized.concat(toBytes(arg));
    } else if (arg instanceof u16) {
      this.serialized = this.serialized.concat(toBytes(bswap(arg)));
    } else if (arg instanceof u32) {
      this.serialized = this.serialized.concat(toBytes(bswap(arg)));
    } else if (arg instanceof string) {
      this.serialized = this.serialized.concat(stringToBytes(arg));
    } else if (arg instanceof StaticArray<u8>) {
      this.serialized = this.serialized.concat(arg);
    } else {
      ERROR('Do not know how to serialize the given type');
    }
    return this;
  }
}

// Emulate abi.encodeWithSelector
export class AbiEncodeWithSelector {
  private serialized: StaticArray<u8> = new StaticArray<u8>(8);

  constructor(selector: Bytes4) {
    this.serialized = new StaticArray<u8>(4);
    memory.copy(
      changetype<usize>(this.serialized),
      changetype<usize>(selector.serialized),
      4,
    );
  }

  serialize(): StaticArray<u8> {
    return this.serialized;
  }

  add<T>(arg: T): this {
    if (arg instanceof u8) {
      let arg32 = new StaticArray<u8>(32 - sizeof<T>()).concat(toBytes(arg));
      this.serialized = this.serialized.concat(arg32);
    } else if (arg instanceof u16) {
      let arg32 = new StaticArray<u8>(32 - sizeof<T>()).concat(
        toBytes(bswap(arg)),
      );
      this.serialized = this.serialized.concat(arg32);
    } else if (arg instanceof Bytes32) {
      this.serialized = this.serialized.concat(arg.serialize());
    } else {
      ERROR('Do not know how to serialize the given type');
    }
    return this;
  }
}
