import { derOpKeys } from '../index';

const keys_ser_ok1: StaticArray<u8> = [1, 0, 0, 0, 2, 255, 0]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keys_ser_ok1_expected_len: i32 = 1;
const keys_ser_ok1_expected_len_sub: i32 = 2;
// const keys_ser_ok1_expected: Array<StaticArray<u8>> = [[255, 0]];

const keys_ser_ok2: StaticArray<u8> = [2, 0, 0, 0, 2, 127, 254, 1, 99]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
// const keys_ser_ok2: ArrayBuffer = new ArrayBuffer([2, 0, 0, 0, 2, 127, 254, 1, 99]);
const keys_ser_ok2_expected_len: i32 = 2;
const keys_ser_ok2_expected_len_sub1: i32 = 2;
const keys_ser_ok2_expected_len_sub2: i32 = 1;
// const keys_ser_ok2_expected: Array<StaticArray<u8>> = [[127, 254], [99]];

const keys_ser_ko8: StaticArray<u8> = []; // edge case

describe('index tests', () => {
  it('derOpKeys ok 1', () => {

    // log<string>("hello world");
    let res = derOpKeys(keys_ser_ok1);

    expect(res.length).toBe(keys_ser_ok1_expected_len);
    expect(res[0].length).toBe(keys_ser_ok1_expected_len_sub);
    // FIXME
    // expect<Array<StaticArray<u8>>>(res).toBe(keys_ser_ok1_expected);
    // expect(res).toBe(keys_ser_ok1_expected);
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);
  });

  it('derOpKeys ok 2', () => {
    let res = derOpKeys(keys_ser_ok2);
    expect(res.length).toBe(keys_ser_ok2_expected_len);
    expect(res[0].length).toBe(keys_ser_ok2_expected_len_sub1);
    expect(res[1].length).toBe(keys_ser_ok2_expected_len_sub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);
  });

  it('derOpKeys ko 8', () => {
    let res_8 = derOpKeys(keys_ser_ko8);
    expect(res_8.length).toBe(0);
  });
});
