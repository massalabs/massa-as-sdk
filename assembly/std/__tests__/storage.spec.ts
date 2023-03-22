import { Storage } from '..';
import { Args } from '@massalabs/as-types';

describe('Storage tests', () => {
  it('checks the set command', () => {
    Storage.set(new StaticArray<u8>(0), new StaticArray<u8>(0));
    Storage.set('1', '1');
    Storage.set(new Args(), new Args());
    Storage.set(new Uint8Array(0), new Uint8Array(0));
  });

  it('checks the get command', () => {
    Storage.get(new StaticArray<u8>(0));
    Storage.get('1');
    Storage.get(new Args());
    Storage.get(new Uint8Array(0));
  });

  it('checks the set/get commands with StaticArray', () => {
    const keyArr: StaticArray<u8> = [1, 2, 3, 4];
    const valueArr: StaticArray<u8> = [5, 6, 7, 8];

    Storage.set(keyArr, valueArr);
    expect(Storage.get(keyArr)).toStrictEqual(valueArr);
  });

  it('checks the set/get commands with string', () => {
    const keyString = 'ABCD';
    const keyValue = 'EFGH';

    Storage.set(keyString, keyValue);
    expect(Storage.get(keyString)).toBe(keyValue);
  });

  it('checks the set/get commands with Args', () => {
    const keyArgs = new Args().add(u64(1));
    const valueArgs = new Args().add(u64.MAX_VALUE);

    Storage.set(keyArgs, valueArgs);
    expect(Storage.get(keyArgs)).toStrictEqual(valueArgs);
  });

  it('checks the set/get commands with uint8Array', () => {
    const uint8Array = new Uint8Array(10);

    for (let i = 0; i < uint8Array.length; i++) {
      uint8Array[i] = i;
    }

    Storage.set(uint8Array, uint8Array);
    expect(Storage.get(uint8Array)).toStrictEqual(uint8Array);
  });
});
