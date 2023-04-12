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
  resetStorage();
});

describe('Testing env coins related functions', () => {
  test('Testing transferCoins (assembly_script_transfer_coins)', () => {
    const amount: u64 = 100;
    const receiverCurrentBalance = env.balanceOf(testAddress.toString());
    // given
    expect(receiverCurrentBalance).toBe(0);
    // when
    env.transferCoins(testAddress.toString(), amount);
    // then
    expect(env.balanceOf(testAddress.toString())).toBe(amount);
  });

  test('Testing transferCoinsOf (assembly_script_transfer_coins_for)', () => {
    const amount: u64 = 100;
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

  test('Testing balanceOf (assembly_script_balance_of)', () => {
    const amount: u64 = 100;
    // given
    expect(env.balanceOf(testAddress.toString())).toBe(0);
    // when
    env.transferCoins(testAddress.toString(), amount);
    // then
    expect(env.balanceOf(testAddress.toString())).toBe(amount);
  });

  test('Testing balance (assembly_script_balance)', () => {
    // The balance of the current contract is 100000
    expect(env.balance()).toBe(100000);
  });

  test('Testing callCoins (assembly_script_get_call_coins)', () => {
    // We don't have a way to set the call coins yet in the mock
    expect(env.callCoins()).toBe(0);
  });
});
