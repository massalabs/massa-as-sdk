import { Bytes32, Bytes4 } from '../solidity_compat/bytes';

describe('Bytes32', () => {
  throws('test with len > 32', () => {
    let sa1 = new StaticArray<u8>(33);
    sa1.fill(1);
    let _mb32 = new Bytes32().add(sa1);
  });

  it('test with static array 1', () => {
    let sa1 = new StaticArray<u8>(2);
    sa1.fill(87); // W, W -> 0x57, 0x57
    let sa2 = new StaticArray<u8>(2);
    sa2.fill(111); // o, o -> 0x6F, 0x6F
    let mb32 = new Bytes32().add(sa1).add(sa2);

    let _expected: Array<u8> = [
      87, 87, 111, 111, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    let mb32Ser = mb32.serialize();

    expect<i32>(expected.length).toBe(32);
    expect<i32>(mb32Ser.length).toBe(expected.length);
    expect<StaticArray<u8>>(mb32Ser).toStrictEqual(expected);
  });
  it('test with static array max len', () => {
    let sa1 = new StaticArray<u8>(32);
    sa1.fill(1);
    let mb32 = new Bytes32().add(sa1);
    let mb32Ser = mb32.serialize();

    let _expected: Array<u8> = [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(32);
    expect<i32>(mb32Ser.length).toBe(expected.length);
    expect<StaticArray<u8>>(mb32Ser).toStrictEqual(expected);
  });
  it('test with string 1', () => {
    // aA1: 97, 65, 49
    let mb32 = new Bytes32().add('aA1').add('bB2');

    let mb32Ser = mb32.serialize();

    let _expected: Array<u8> = [
      97, 65, 49, 98, 66, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(32);
    expect<i32>(mb32Ser.length).toBe(expected.length);
    expect<StaticArray<u8>>(mb32Ser).toStrictEqual(expected);
  });
});

describe('Bytes4', () => {
  it('Bytes4 + add string', () => {
    let b4: Bytes4 = new Bytes4().add<string>('1111');
    let b4Ser = b4.serialize();

    let _expected: Array<u8> = [49, 49, 49, 49];
    let expected: StaticArray<u8> = StaticArray.fromArray(_expected);

    expect<i32>(expected.length).toBe(4);
    expect<i32>(b4Ser.length).toBe(expected.length);
    expect<StaticArray<u8>>(b4Ser).toStrictEqual(expected);
  });
  // FIXME: this fails but why?
  /*
    throws("test with len > 4", () => {
        let sa1 = new StaticArray<u8>(5);
        sa1.fill(1);
        let mb4 = new Bytes4().add(sa1);
    });
    */
});
