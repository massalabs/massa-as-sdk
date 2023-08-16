import { Serializable, stringToBytes } from '@massalabs/as-types';

export class Bytes32 {
  private MAX_LEN: i32 = 32;
  // private _offset: i32 = 0;
  private serialized: StaticArray<u8> = new StaticArray<u8>(32);
  private offset_ser: i32 = 0;

  add<T>(arg: T): this {
    if (arg instanceof StaticArray<u8>) {
      assert(this.offset_ser + arg.length <= this.MAX_LEN);

      // FIXME: can only use memory.copy if managed
      // check: https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/staticarray.ts
      //        fromArray
      memory.copy(
        changetype<usize>(this.serialized) + this.offset_ser,
        changetype<usize>(arg),
        arg.length,
      );
      this.offset_ser += arg.length;
    } else if (arg instanceof string) {
      let _arg = stringToBytes(arg);
      assert(this.offset_ser + _arg.length <= this.MAX_LEN);
      memory.copy(
        changetype<usize>(this.serialized) + this.offset_ser,
        changetype<usize>(_arg),
        _arg.length,
      );
      this.offset_ser += _arg.length;
    } else {
      ERROR('Do not know how to serialize the given type');
    }
    return this;
  }

  serialize(): StaticArray<u8> {
    return this.serialized;
  }
}

abstract class BytesLen implements Serializable {
  private serialized: StaticArray<u8> = new StaticArray<u8>(0);
  private offset_ser: i32 = 0;

  abstract max_len(): i32;

  constructor() {
    this.serialized = new StaticArray<u8>(this.max_len());
  }

  _add<T>(arg: T): this {
    const MAX_LEN = this.max_len();
    if (arg instanceof StaticArray<u8>) {
      assert(this.offset_ser + arg.length <= MAX_LEN);

      // FIXME: can only use memory.copy if managed
      // check: https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/staticarray.ts
      //        fromArray
      memory.copy(
        changetype<usize>(this.serialized) + this.offset_ser,
        changetype<usize>(arg),
        arg.length,
      );
      this.offset_ser += arg.length;
    } else if (arg instanceof string) {
      let _arg = stringToBytes(arg);
      assert(this.offset_ser + arg.length <= MAX_LEN);
      memory.copy(
        changetype<usize>(this.serialized) + this.offset_ser,
        changetype<usize>(_arg),
        _arg.length,
      );
      this.offset_ser += arg.length;
    } else {
      ERROR('Do not know how to serialize the given type');
    }
    return this;
  }

  public serialize(): StaticArray<u8> {
    return this.serialized;
  }

  /*
  public deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);
    this.serialized = args.getNextData(this.max_len());
    return new Result(args.offset);
  }
  */
}

export class Bytes4 extends BytesLen {
  @inline
  max_len(): i32 {
    return 4;
  }

  add<T>(arg: T): Bytes4 {
    return changetype<Bytes4>(this._add(arg));
  }
}
