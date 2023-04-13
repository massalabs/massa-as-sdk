// This file is aim to test the env storage functions which are external functions

import { env } from '../env';
import { addAddressToLedger, resetStorage } from '../vm-mock';
import { Address, Storage } from '../std';
import { stringToBytes } from '@massalabs/as-types';

const ownedAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

beforeEach(() => {
  resetStorage();
});

describe('Testing env storage functions', () => {
  it('deletes a key', () => {
    const key: string = 'test';
    const value: string = 'value';
    // given
    Storage.set(key, value);
    expect(Storage.get(key)).not.toBeNull();
    // when
    env.del(stringToBytes(key));
    // then
    expect(env.has(stringToBytes(key))).toBe(false);
  });

  it('deletes the key of a different address', () => {
    const key: string = 'test';
    const value: string = 'value';
    // given
    addAddressToLedger(ownedAddress.toString());
    Storage.setOf(ownedAddress, key, value);
    expect(Storage.getOf(ownedAddress, key)).not.toBeNull();
    // when
    env.deleteOf(ownedAddress.toString(), stringToBytes(key));
    // then
    expect(env.hasOf(ownedAddress.toString(), stringToBytes(key))).toBe(false);
  });

  it('appends a value to a specific key', () => {
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

  it('appends a value to a specific key and a different address', () => {
    const key: string = 'test';
    const value: string = 'hello';
    const appendValue: string = 'world';
    // given
    Storage.setOf(ownedAddress, key, value);
    expect(Storage.getOf(ownedAddress, key)).toBe(value);
    // when
    env.appendOf(
      ownedAddress.toString(),
      stringToBytes(key),
      stringToBytes(appendValue),
    );
    // then
    expect(Storage.getOf(ownedAddress, key)).toBe(value + appendValue);
  });
});
