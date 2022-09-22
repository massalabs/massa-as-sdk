import { derOpKeys } from '../index';

const keys_ser_ok1: Array<u8> = [1, 0, 0, 0, 2, 255, 0]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keys_ser_ok1_expected_len: i32 = 1;
const keys_ser_ok1_expected_len_sub: i32 = 2;
// const keys_ser_ok1_expected: Array<StaticArray<u8>> = [[255, 0]];

const keys_ser_ok2: Array<u8> = [2, 0, 0, 0, 2, 127, 254, 1, 99]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
// const keys_ser_ok2: ArrayBuffer = new ArrayBuffer([2, 0, 0, 0, 2, 127, 254, 1, 99]);
const keys_ser_ok2_expected_len: i32 = 2;
const keys_ser_ok2_expected_len_sub1: i32 = 2;
const keys_ser_ok2_expected_len_sub2: i32 = 1;
// const keys_ser_ok2_expected: Array<StaticArray<u8>> = [[127, 254], [99]];

const keys_ser_ko1: Array<u8> = [3, 0, 0, 0, 2]; // wrong format; 3 vec; 1st vec len = 2; no data for 1st vec
const keys_ser_ko2: Array<u8> = [1, 0, 0, 0, 3, 1, 2]; // wrong format; 1 vec; 1st vec len = 3; not enough data for 1st vec
const keys_ser_ko3: Array<u8> = [1, 0, 0, 0, 255, 1, 2]; // wrong format; 1 vec; 1st vec len = 255; not enough data for 1st vec
const keys_ser_ko4: Array<u8> = [255, 255, 255, 255, 2]; // invalid; too much entry
const keys_ser_ko5: Array<u8> = [1, 0, 0, 0, 0]; // edge case; not invalid but meh :-/
const keys_ser_ko6: Array<u8> = [0, 0, 0, 0, 0]; // edge case; not invalid but meh :-/
const keys_ser_ko7: Array<u8> = [1, 0, 0, 0, 2, 127, 254, 1, 99]; // invalid only 1 entry but 2 entries in data
const keys_ser_ko8: Array<u8> = []; // edge case

describe('index tests', () => {
  it('derOpKeys ok 1', () => {

    // log<string>("hello world");
    // Array<u8> -> Uint8Array
    let keys_ser_ok1_ = new Uint8Array(keys_ser_ok1.length);
    keys_ser_ok1_.set(keys_ser_ok1);
    let res = derOpKeys(keys_ser_ok1_);
    expect(res.length).toBe(keys_ser_ok1_expected_len);
    expect(res[0].length).toBe(keys_ser_ok1_expected_len_sub);
    // FIXME
    // expect<Array<StaticArray<u8>>>(res).toBe(keys_ser_ok1_expected);
    // expect(res).toBe(keys_ser_ok1_expected);
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);
  });

  it('derOpKeys ok 2', () => {
    let keys_ser_ok2_ = new Uint8Array(keys_ser_ok2.length);
    keys_ser_ok2_.set(keys_ser_ok2);
    let res = derOpKeys(keys_ser_ok2_);
    expect(res.length).toBe(keys_ser_ok2_expected_len);
    expect(res[0].length).toBe(keys_ser_ok2_expected_len_sub1);
    expect(res[1].length).toBe(keys_ser_ok2_expected_len_sub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);
  });

  it('derOpKeys ko 1', () => {
    let keys_ser_ko1_ = new Uint8Array(keys_ser_ko1.length);
    keys_ser_ko1_.set(keys_ser_ko1);
    let res_1 = derOpKeys(keys_ser_ko1_);
    expect(res_1.length).toBe(0);
  });
  it('derOpKeys ko 2', () => {
    let keys_ser_ko2_ = new Uint8Array(keys_ser_ko2.length);
    keys_ser_ko2_.set(keys_ser_ko2);
    let res_2 = derOpKeys(keys_ser_ko2_);
    expect(res_2.length).toBe(0);
  });
  it('derOpKeys ko 3', () => {
    let keys_ser_ko3_ = new Uint8Array(keys_ser_ko3.length);
    keys_ser_ko3_.set(keys_ser_ko3);
    let res_3 = derOpKeys(keys_ser_ko3_);
    expect(res_3.length).toBe(0);
  });
  it('derOpKeys ko 4', () => {
    let keys_ser_ko4_ = new Uint8Array(keys_ser_ko4.length);
    keys_ser_ko4_.set(keys_ser_ko4);
    let res_4 = derOpKeys(keys_ser_ko4_);
    expect(res_4.length).toBe(0);
  });
  it('derOpKeys ko 5', () => {
    let keys_ser_ko5_ = new Uint8Array(keys_ser_ko5.length);
    keys_ser_ko5_.set(keys_ser_ko5);
    let res_5 = derOpKeys(keys_ser_ko5_);
    expect(res_5.length).toBe(0);
  });
  it('derOpKeys ko 6', () => {
    let keys_ser_ko6_ = new Uint8Array(keys_ser_ko6.length);
    keys_ser_ko6_.set(keys_ser_ko6);
    let res_6 = derOpKeys(keys_ser_ko6_);
    expect(res_6.length).toBe(0);
  });
  it('derOpKeys ko 7', () => {
    let keys_ser_ko7_ = new Uint8Array(keys_ser_ko7.length);
    keys_ser_ko7_.set(keys_ser_ko7);
    let res_7 = derOpKeys(keys_ser_ko7_);
    expect(res_7.length).toBe(0);
  });
  it('derOpKeys ko 8', () => {
    let keys_ser_ko8_ = new Uint8Array(keys_ser_ko8.length);
    keys_ser_ko8_.set(keys_ser_ko8);
    let res_8 = derOpKeys(keys_ser_ko8_);
    expect(res_8.length).toBe(0);
  });
});
