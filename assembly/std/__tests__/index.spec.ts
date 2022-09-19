import {derOpKeys} from '../index';

describe('index tests', () => {
  it('op datastore tests', () => {

    // log<string>("hello world");

    let keys_ser_ok1: StaticArray<u8> = [1, 0, 0, 0, 2, 255, 0]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
    let keys_ser_ok1_expected_len: i32 = 1;
    let keys_ser_ok1_expected_len_sub: i32 = 2;
    let keys_ser_ok1_expected: Array<StaticArray<u8>> = [[255, 0]];

    let keys_ser_ok2: StaticArray<u8> = [2, 0, 0, 0, 2, 127, 254, 1, 99]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
    let keys_ser_ok2_expected_len: i32 = 2;
    let keys_ser_ok2_expected_len_sub1: i32 = 2;
    let keys_ser_ok2_expected_len_sub2: i32 = 1;
    let keys_ser_ok2_expected: Array<StaticArray<u8>> = [[127, 254], [99]];

    let keys_ser_ko1: StaticArray<u8> = [3, 0, 0, 0, 2]; // wrong format; 3 vec; 1st vec len = 2; no data for 1st vec
    let keys_ser_ko2: StaticArray<u8> = [1, 0, 0, 0, 3, 1, 2]; // wrong format; 1 vec; 1st vec len = 3; not enough data for 1st vec
    let keys_ser_ko3: StaticArray<u8> = [1, 0, 0, 0, 255, 1, 2]; // wrong format; 1 vec; 1st vec len = 255; not enough data for 1st vec
    let keys_ser_ko4: StaticArray<u8> = [255, 255, 255, 255, 2]; // invalid; too much entry
    let keys_ser_ko5: StaticArray<u8> = [1, 0, 0, 0, 0]; // edge case; not invalid but meh :-/
    let keys_ser_ko6: StaticArray<u8> = [0, 0, 0, 0, 0]; // edge case; not invalid but meh :-/
    let keys_ser_ko7: StaticArray<u8> = [1, 0, 0, 0, 2, 127, 254, 1, 99]; // invalid only 1 entry but 2 entries in data

    let res = derOpKeys(keys_ser_ok1);
    expect(res.length).toBe(keys_ser_ok1_expected_len);
    expect(res[0].length).toBe(keys_ser_ok1_expected_len_sub);
    // FIXME
    // expect<Array<StaticArray<u8>>>(res).toBe(keys_ser_ok1_expected);
    // expect(res).toBe(keys_ser_ok1_expected);
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);

    res = derOpKeys(keys_ser_ok2);
    expect(res.length).toBe(keys_ser_ok2_expected_len);
    expect(res[0].length).toBe(keys_ser_ok2_expected_len_sub1);
    expect(res[1].length).toBe(keys_ser_ok2_expected_len_sub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);

    let res_1 = derOpKeys(keys_ser_ko1);
    expect(res_1.length).toBe(0);
    let res_2 = derOpKeys(keys_ser_ko2);
    expect(res_2.length).toBe(0);
    let res_3 = derOpKeys(keys_ser_ko3);
    expect(res_3.length).toBe(0);
    let res_4 = derOpKeys(keys_ser_ko4);
    expect(res_4.length).toBe(0);
    let res_5 = derOpKeys(keys_ser_ko5);
    expect(res_5.length).toBe(0);
    let res_6 = derOpKeys(keys_ser_ko6);
    expect(res_6.length).toBe(0);
    let res_7 = derOpKeys(keys_ser_ko7);
    expect(res_7.length).toBe(0);
  });
});
