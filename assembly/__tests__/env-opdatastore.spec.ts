import { env } from '../env/index';
import { getOpData, getOpKeys, getOpKeysPrefix, hasOpKey } from '../std';

import { resetStorage, setOpData } from '../vm-mock/storage';
import { stringToBytes } from '@massalabs/as-types';

describe('Testing mocked Operation Datastore', () => {
  beforeAll(() => {
    resetStorage();
  });

  afterEach(() => {
    resetStorage();
  });

  test('hasOpKey - key not exists', () => {
    expect(hasOpKey(stringToBytes('key1'))).toBe(false);
  });

  test('getOpKey - key exists', () => {
    const key = stringToBytes('key1');
    const value = stringToBytes('value1');
    setOpData(key, value);
    expect(hasOpKey(key)).toBe(true);
  });

  throws('getOpData - key not exists', () => {
    getOpData(stringToBytes('key2'));
  });

  test('getOpData - key exists', () => {
    const key = stringToBytes('key1');
    const value = stringToBytes('value1');
    setOpData(key, value);
    expect(getOpData(key)).toStrictEqual(value);
  });

  test('getOpKeys - no keys', () => {
    expect(getOpKeys()).toStrictEqual([]);
  });

  test('getOpKeys - keys found', () => {
    const key1 = stringToBytes('key1');
    const value1 = stringToBytes('value1');
    setOpData(key1, value1);
    const key2 = stringToBytes('key2');
    const value2 = stringToBytes('value2');
    setOpData(key2, value2);

    expect(getOpKeys().length).toBe(2);
    expect(getOpKeys()).toStrictEqual([key1, key2]);
  });

  test('getOpKeysPrefix - dummy prefix, no keys', () => {
    expect(getOpKeysPrefix([1, 2, 3])).toStrictEqual([]);
  });

  test('getOpKeysPrefix - dummy prefix', () => {
    const key1 = stringToBytes('key1');
    const value1 = stringToBytes('value1');
    setOpData(key1, value1);
    expect(getOpKeysPrefix([1, 2, 3])).toStrictEqual([]);
  });

  test('getOpKeysPrefix - get 2 keys', () => {
    const key1 = stringToBytes('key1');
    const value1 = stringToBytes('value1');
    setOpData(key1, value1);
    const key2 = stringToBytes('key2');
    const value2 = stringToBytes('value2');
    setOpData(key2, value2);

    const prefix = stringToBytes('key');
    expect(getOpKeysPrefix(prefix).length).toBe(2);
    expect(getOpKeysPrefix(prefix)).toStrictEqual([key1, key2]);
  });

  test('getOpKeysPrefix - get 1 keys', () => {
    const key1 = stringToBytes('key1');
    const value1 = stringToBytes('value1');
    setOpData(key1, value1);
    const key2 = stringToBytes('key2');
    const value2 = stringToBytes('value2');
    setOpData(key2, value2);

    expect(getOpKeysPrefix(key1).length).toBe(1);
    expect(getOpKeysPrefix(key1)).toStrictEqual([key1]);
  });
});
