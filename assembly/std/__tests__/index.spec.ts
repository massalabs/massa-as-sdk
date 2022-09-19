import {derOpKeys} from '../index';

describe('Address tests', () => {
  it('basic tests', () => {
    let keys_ser: StaticArray<u8> = [1, 0, 0, 0, 2, 255, 0]; // Ok: 1 entry; 1st vec len = 2; data: [255, 0]
    let keys_ser: StaticArray<u8> = [3, 0, 0, 0, 2]; // wrong format; 3 vec; 1st vec len = 2; no data for 1st vec
    let keys_ser: StaticArray<u8> = [1, 0, 0, 0, 255, 1, 2]; // wrong format; 1 vec; 1st vec len = 255; not enough data for 1st vec
    let keys_ser: StaticArray<u8> = [255, 255, 255, 255, 2]; // invalid; too much entry

    expect(derOpKeys(keys_ser)).toBe([[255, 0]);
    // TODO
  }
}
