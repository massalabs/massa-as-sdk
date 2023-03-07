import { bytesToString } from '@massalabs/as-types';
import { derKeys } from '../index';

// Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keysSerOk1: StaticArray<u8> = [
  1, // Entry count: 1
  0,
  0,
  0,
  2, // Length of key data: 2 bytes
  255,
  0, // Key data: [255, 0]
];
const keysSerOk1ExpectedLen: i32 = 1;
const keysSerOk1ExpectedLenSub: i32 = 2;
const keysSerOk1Expected: Array<StaticArray<u8>> = [[255, 0]];

const keysSerOk2: StaticArray<u8> = [
  2, // Entry count: 1
  // 1st key
  0,
  0,
  0,
  2, // Length of key data: 2 bytes
  127,
  254, // Key data: [127, 254]
  // 2nd key
  1, // Length of key data: 1 byte
  99, // Key data: [99]
];
const keysSerOk2ExpectedLen: i32 = 2;
const keysSerOk2ExpectedLenSub1: i32 = 2;
const keysSerOk2ExpectedLenSub2: i32 = 1;

const keySerOk3: StaticArray<u8> = [
  1, // Entry count: 1
  0,
  0,
  0,
  5, // Length of key data: 5 bytes
  104,
  101,
  108,
  108,
  111, // Key data: "hello"
];

const keysSerKo8: StaticArray<u8> = []; // edge case

describe('index tests', () => {
  it('derOpKeys ok 1', () => {
    let res = derKeys(keysSerOk1);

    expect(res.length).toBe(keysSerOk1ExpectedLen);
    expect(res[0].length).toBe(keysSerOk1ExpectedLenSub);
    expect(res.toString()).toBe(keysSerOk1Expected.toString());
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);
  });

  it('derOpKeys ok 2', () => {
    let res = derKeys(keysSerOk2);
    expect(res.length).toBe(keysSerOk2ExpectedLen);
    expect(res[0].length).toBe(keysSerOk2ExpectedLenSub1);
    expect(res[1].length).toBe(keysSerOk2ExpectedLenSub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);
  });

  it('derOpKeys ko 8', () => {
    let res8 = derKeys(keysSerKo8);
    expect(res8.length).toBe(0);
  });

  it('derOpKeys ok 3', () => {
    let res = derKeys(keySerOk3);
    expect(res.length).toBe(1);
    expect(res[0].length).toBe(5);
    expect(res[0][0]).toBe(104);
    expect(res[0][1]).toBe(101);
    expect(res[0][2]).toBe(108);
    expect(res[0][3]).toBe(108);
    expect(res[0][4]).toBe(111);
    expect(bytesToString(res[0])).toBe('hello');
  });
});
