// This file is aim to test the env coins related functions which are external functions

import { env } from '../env';
import { resetStorage } from '../vm-mock';
import { Address, Storage } from '../std';
import { stringToBytes } from '@massalabs/as-types';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

const testAddress2 = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oT',
);

beforeEach(() => {
  // We set the balance of the current contract to 100000 in the resetStorage
  resetStorage();
});

describe('Testing env coins related functions', () => {
  it('transferCoins', () => {
    const amount: u64 = 100;
    // The sender is the current contract executing the transfer
    const senderBalance = env.balance();
    const receiverCurrentBalance = env.balanceOf(testAddress.toString());
    // given
    expect(senderBalance).toBe(100000);
    expect(receiverCurrentBalance).toBe(0);
    // when
    env.transferCoins(testAddress.toString(), amount);
    // then
    expect(env.balanceOf(testAddress.toString())).toBe(amount);
  });

  it('transferCoins of another address', () => {
    const amount: u64 = 100;
    // we first transfer coins to the emitter address
    env.transferCoins(testAddress.toString(), amount);

    const emitterCurrentBalance = env.balanceOf(testAddress.toString());
    const receiverCurrentBalance = env.balanceOf(testAddress2.toString());
    // given
    expect(emitterCurrentBalance).toBeGreaterThanOrEqual(amount);
    expect(receiverCurrentBalance).toBe(0);
    // when
    env.transferCoinsOf(
      testAddress.toString(),
      testAddress2.toString(),
      amount,
    );
    // then
    expect(env.balanceOf(testAddress2.toString())).toBe(amount);
  });

  it('get the balance of an address', () => {
    const amount: u64 = 100;
    // given
    expect(env.balanceOf(testAddress.toString())).toBe(0);
    // when
    env.transferCoins(testAddress.toString(), amount);
    // then
    expect(env.balanceOf(testAddress.toString())).toBe(amount);
  });

  it('get the balance of the current address', () => {
    // The balance of the current contract is 100000
    expect(env.balance()).toBe(100000);
  });

  it('callCoins', () => {
    // We don't have a way to set the call coins yet in the mock
    expect(env.callCoins()).toBe(0);
  });
});
