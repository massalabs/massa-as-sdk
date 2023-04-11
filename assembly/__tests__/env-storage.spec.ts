// This file is aim to test the env storage functions which are external functions

import { env } from '../env';
import { resetStorage } from '../vm-mock';
import { Address, Storage } from '../std';
import { stringToBytes } from '@massalabs/as-types';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

beforeEach(() => {
  resetStorage();
});

describe('Testing env storage functions', () => {
  test('Testing del (assembly_script_delete_data)', () => {
    const key: string = 'test';
    const value: string = 'value';
    // given
    Storage.set(key, value);
    expect(Storage.get(key)).not.toBeNull();
    // when
    env.del(stringToBytes(key));
    // then
    expect(Storage.get(key)).toBeFalsy();
  });

  test('Testing deleteOf (assembly_script_delete_data_for)', () => {
    const key: string = 'test';
    const value: string = 'value';
    // given
    Storage.setOf(testAddress, key, value);
    expect(Storage.getOf(testAddress, key)).not.toBeNull();
    // when
    env.deleteOf(testAddress.toString(), stringToBytes(key));
    // then
    expect(Storage.getOf(testAddress, key)).toBeFalsy();
  });

  test('Testing append (assembly_script_append_data)', () => {
    const key: string = 'test';
    const value: string = 'hello';
    const appendValue: string = 'world';
    // given
    Storage.set(key, value);
    expect(Storage.get(key)).toBe(value);
    // when
    env.append(stringToBytes(key), stringToBytes(appendValue));
    // then
    expect(Storage.get(key)).toBe(value + appendValue);
  });

  test('Testing appendOf (assembly_script_append_data_for)', () => {
    const key: string = 'test';
    const value: string = 'hello';
    const appendValue: string = 'world';
    // given
    Storage.setOf(testAddress, key, value);
    expect(Storage.getOf(testAddress, key)).toBe(value);
    // when
    env.appendOf(
      testAddress.toString(),
      stringToBytes(key),
      stringToBytes(appendValue),
    );
    // then
    expect(Storage.getOf(testAddress, key)).toBe(value + appendValue);
  });
});
