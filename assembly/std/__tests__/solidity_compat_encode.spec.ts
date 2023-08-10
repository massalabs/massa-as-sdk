import { u256 } from 'as-bignum/assembly';
import {
  AbiEncodePacked,
  AbiEncode,
  AbiEncodeWithSelector,
} from '../solidity_compat/encode';
import { Bytes32, Bytes4 } from '../solidity_compat/bytes';

describe('AbiEncodePacked', () => {
  it('test multi 1', () => {
    let val1: u16 = u16.MAX_VALUE; // 0xFF -> 255, 255
    let val2: u8 = 42; // 42
    let val3: u16 = 3; // 0 3
    let val4: u32 = 7; // 0 0 0 7
    let val5: string = 'aAbc1'; // 0x6141626331 -> 97, 65, ....

    //                          val1,    val2,val3, val4,       val5
    let _expected: Array<u8> = [
      255, 255, 42, 0, 3, 0, 0, 0, 7, 97, 65, 98, 99, 49,
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    let ap = new AbiEncodePacked();
    ap.add<u16>(val1);
    ap.add<u8>(val2);
    ap.add<u16>(val3);
    ap.add<u32>(val4);
    ap.add<string>(val5);

    let apSer = ap.serialize();

    expect<i32>(apSer.length).toBe(expected.length);
    expect<StaticArray<u8>>(apSer).toStrictEqual(expected);
  });

  it('test multi 2', () => {
    let sa1 = new StaticArray<u8>(2);
    sa1.fill(87); // W, W -> 0x57, 0x57
    let sa2 = new StaticArray<u8>(2);
    sa2.fill(111); // o, o -> 0x6F, 0x6F

    let _expected: Array<u8> = [87, 87, 111, 111];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    let ap = new AbiEncodePacked();
    ap.add<StaticArray<u8>>(sa1);
    ap.add<StaticArray<u8>>(sa2);
    let apSer = ap.serialize();

    expect<i32>(apSer.length).toBe(expected.length);
    expect<StaticArray<u8>>(apSer).toStrictEqual(expected);
  });
});

describe('AbiEncodeWithSelector', () => {
  it('test empty', () => {
    let b4 = new Bytes4().add('1111');
    let aSel = new AbiEncodeWithSelector(b4);
    let aSelSer = aSel.serialize();

    let _expected: Array<u8> = [49, 49, 49, 49];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(4);
    expect<i32>(aSelSer.length).toBe(expected.length);
    expect<StaticArray<u8>>(aSelSer).toStrictEqual(expected);
  });
  it('test with u8 / u16', () => {
    let b4 = new Bytes4().add('1111');
    let aSel = new AbiEncodeWithSelector(b4).add<u16>(65283).add<u8>(42);
    // let aSel = new ArgsWithSelector(b4).add<u16>(65283);
    // let aSel = new ArgsWithSelector(b4).add<u8>(42);
    let aSelSer = aSel.serialize();

    let _expected: Array<u8> = [
      49, 49, 49, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42,
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(68); // 4 + 32 + 32
    expect<i32>(aSelSer.length).toBe(expected.length);
    expect<StaticArray<u8>>(aSelSer).toStrictEqual(expected);
  });
  it('test with Bytes32', () => {
    let b4 = new Bytes4().add('1111');
    let b32 = new Bytes32().add('AiuuuuuuuuuuuuuuuuuuuuuuuuuuuAiu');

    let aSel = new AbiEncodeWithSelector(b4).add(b32);
    let aSelSer = aSel.serialize();

    let _expected: Array<u8> = [
      49,
      49,
      49,
      49, // 1111
      65,
      105,
      117,
      117, // Aiuu
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      117,
      65,
      105,
      117, // uAiu
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(36); // 4 + 32
    expect<i32>(aSelSer.length).toBe(expected.length);
    expect<StaticArray<u8>>(aSelSer).toStrictEqual(expected);
  });
});

describe('AbiEncode', () => {
  it('test u8', () => {
    let v2: u8 = 42;
    let _expected: Array<u8> = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 42,
    ];
    let encode = new AbiEncode().add(v2);
    let enc = encode.serialize();

    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(32);
    expect<i32>(enc.length).toBe(expected.length);
    expect<StaticArray<u8>>(enc).toStrictEqual(expected);
  });
  it('test u16', () => {
    let v2: u16 = 65535;
    let _expected: Array<u8> = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 255, 255,
    ];
    let encode = new AbiEncode().add(v2);
    let enc = encode.serialize();

    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(32);
    expect<i32>(enc.length).toBe(expected.length);
    expect<StaticArray<u8>>(enc).toStrictEqual(expected);
  });
  it('test u256', () => {
    let v2: u256 = u256.Max;
    v2 = v2.postDec();
    let _expected: Array<u8> = [
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 254,
    ];
    let encode = new AbiEncode().add(v2);
    let enc = encode.serialize();

    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(32);
    expect<i32>(enc.length).toBe(expected.length);
    expect<StaticArray<u8>>(enc).toStrictEqual(expected);
  });
  it('test str 1', () => {
    let v2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
    assert(v2.length == 32);

    let _expected: Array<u8> = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32, // 32 (offset)
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32, // 32 (str as bytes len)
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      98, // aaaa...ab (bytes)
    ];

    let encode = new AbiEncode().add(v2);
    let enc = encode.serialize();

    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    // 32 (offset) + 32 (v2 size) + 32 (v2 len)
    expect<i32>(expected.length).toBe(96);
    expect<i32>(enc.length).toBe(expected.length);
    expect<StaticArray<u8>>(enc).toStrictEqual(expected);
  });

  it('test str 2 (> 32)', () => {
    let v2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabaaaaaaaaaaaaaaaaaaac';
    assert(v2.length == 52);

    let _expected: Array<u8> = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32, // 32 (offset)
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      52, // 32 (str as bytes len)
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      98, // aaa...ab

      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0, // a...ac
    ];

    let encode = new AbiEncode().add(v2);
    let enc = encode.serialize();

    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    // 32 (offset) + 32 (v2 size) + 32 (v2 len)
    expect<i32>(expected.length).toBe(128);
    expect<i32>(enc.length).toBe(expected.length);
    expect<StaticArray<u8>>(enc).toStrictEqual(expected);
  });
});
