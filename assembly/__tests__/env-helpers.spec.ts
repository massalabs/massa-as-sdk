// This file is aim to test the env helpers functions which are external functions.

import { env } from '../env';
import { Address } from '../std';
import { addAddressToLedger, mockCurrentSlot } from '../vm-mock';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

describe('Testing env coins related functions', () => {
  test('get the currentPeriod', () => {
    expect(env.currentPeriod()).toBe(0);
  });

  test('get the currentThread', () => {
    expect(env.currentThread()).toBe(1);
  });

  test('current slot', () => {
    mockCurrentSlot(1234, 8);
    expect(env.currentPeriod()).toBe(1234);
    expect(env.currentThread()).toBe(8);
  });

  test('setBytecode', () => {
    env.setBytecode(new StaticArray(0));
    const byteCode = env.getBytecode().toString();
    expect(byteCode).toBe('');
  });

  test('setBytecodeFor', () => {
    addAddressToLedger(testAddress.toString());
    env.setBytecodeOf(testAddress.toString(), new StaticArray(0));
    const byteCode = env.getBytecodeOf(testAddress.toString()).toString();
    expect(byteCode).toBe('');
  });

  test('getBytecodeOf', () => {
    expect(env.getBytecodeOf(testAddress.toString())).toBeTruthy();
  });
});
