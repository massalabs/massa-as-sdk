import { env } from '../env/index';

import { changeCallStack, resetStorage } from '../vm-mock/storage';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';

describe('Testing mocked Operation Datastore', () => {
  beforeAll(() => {
    resetStorage();
  });

  afterEach(() => {
    resetStorage();
  });

  test('hasOpKey - key not exists', () => {
    expect(env.hasOpKey(stringToBytes('key1'))).toBeNull();
  });

  test('getOpKey - key exists', () => {
    env.set(stringToBytes('key1'), stringToBytes('value1'));
    expect(env.hasOpKey(stringToBytes('key1'))).not.toBeNull();
  });

  test('getOpData - key not exists', () => {
    expect(env.getOpData(stringToBytes('key1'))).toBeNull();
  });

  test('getOpData - key exists', () => {
    env.set(stringToBytes('key1'), stringToBytes('value1'));
    expect(env.getOpData(stringToBytes('key1'))).not.toBeNull();
  });

  test('getOpKeys - no keys', () => {
    const expected: StaticArray<u8> = [0, 0, 0, 0];
    expect(env.getOpKeys()).toStrictEqual(expected);
  });

  test('getOpKeys - keys found', () => {
    env.set(stringToBytes('key1'), stringToBytes('value1'));
    env.set(stringToBytes('key2'), stringToBytes('value2'));
    env.set(stringToBytes('key3'), stringToBytes('value3'));

    expect(env.getOpKeys()).not.toBeNull();
  });

  test('getOpKeys - expected specific keys ', () => {
    env.set(stringToBytes('key1'), stringToBytes('value1'));
    env.set(stringToBytes('key2'), stringToBytes('value2'));
    env.set(stringToBytes('key3'), stringToBytes('value3'));
    const expected: StaticArray<u8> = [
      3, 0, 0, 0, 4, 107, 101, 121, 49, 4, 107, 101, 121, 50, 4, 107, 101, 121,
      51,
    ];
    expect(env.getOpKeys()).toStrictEqual(expected);
  });
});
