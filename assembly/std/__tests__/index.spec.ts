import {derOpKeys} from '../index';

// Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keysSerOk1: StaticArray<u8> = [1, 0, 0, 0, 2, 255, 0];
const keysSerOk1ExpectedLen: i32 = 1;
const keysSerOk1ExpectedLenSub: i32 = 2;
// const keysSerOk1Expected: Array<StaticArray<u8>> = [[255, 0]];

// Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keysSerOk2: StaticArray<u8> = [2, 0, 0, 0, 2, 127, 254, 1, 99];
// const keysSerOk2: ArrayBuffer = new ArrayBuffer([
//   2, 0, 0, 0, 2, 127, 254, 1, 99,
// ]);
const keysSerOk2ExpectedLen: i32 = 2;
const keysSerOk2ExpectedLenSub1: i32 = 2;
const keysSerOk2ExpectedLenSub2: i32 = 1;
// const keysSerOk2_expected: Array<StaticArray<u8>> = [[127, 254], [99]];

const keysSerKo8: StaticArray<u8> = []; // edge case

describe('index tests', () => {
  it('derOpKeys ok 1', () => {
    // log<string>("hello world");
    let res = derOpKeys(keysSerOk1);

    expect(res.length).toBe(keysSerOk1ExpectedLen);
    expect(res[0].length).toBe(keysSerOk1ExpectedLenSub);
    // FIXME
    // expect<Array<StaticArray<u8>>>(res).toBe(keysSerOk1Expected);
    // expect(res).toBe(keysSerOk1Expected);
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);
  });

  it('derOpKeys ok 2', () => {
    let res = derOpKeys(keysSerOk2);
    expect(res.length).toBe(keysSerOk2ExpectedLen);
    expect(res[0].length).toBe(keysSerOk2ExpectedLenSub1);
    expect(res[1].length).toBe(keysSerOk2ExpectedLenSub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);
  });

  it('derOpKeys ko 8', () => {
    let res8 = derOpKeys(keysSerKo8);
    expect(res8.length).toBe(0);
  });
});
