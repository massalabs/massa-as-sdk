import { Address } from './../address';
import {
  callee,
  caller,
  ownedAddresses,
  transactionCreator,
  transferredCoins,
} from '../context';

describe('Context', () => {
  test('test ownedAddresses', () => {
    const addresses: Address[] = ownedAddresses();
    expect(addresses.length).toBeGreaterThan(0);
  });

  test('caller', () => {
    const address: Address = caller();
    expect(address.isValid()).toBe(true);
  });

  test('test callee', () => {
    const address: Address = callee();
    expect(address.isValid()).toBe(true);
  });

  test('test transactionCreator', () => {
    const address: Address = transactionCreator();
    expect(address.isValid()).toBe(true);
  });

  test('test transferredCoins', () => {
    const coins = transferredCoins();
    expect(coins).toBe(0);
  });
});
