import { Address } from './../address';
import {
  callee,
  caller,
  ownedAddresses,
  transactionCreator,
  transferredCoins,
  isDeployingContract,
  timestamp,
} from '../context';
import { validateAddress } from '../utils';

describe('Context', () => {
  test('ownedAddresses', () => {
    const addresses: Address[] = ownedAddresses();
    expect(addresses.length).toBeGreaterThan(0);
    expect(validateAddress(addresses[0].toString())).toBe(true);
  });

  test('caller', () => {
    const address: Address = caller();
    expect(validateAddress(address.toString())).toBe(true);
  });

  test('callee', () => {
    const address: Address = callee();
    expect(validateAddress(address.toString())).toBe(true);
  });

  test('transactionCreator', () => {
    const address: Address = transactionCreator();
    expect(validateAddress(address.toString())).toBe(true);
  });

  test('transferredCoins', () => {
    const coins = transferredCoins();
    expect(coins).toBe(0);
  });

  test('isDeployingContract', () => {
    expect(isDeployingContract()).toBe(false);
  });

  test('timestamp', () => {
    const time = timestamp();
    expect(time).toBeGreaterThan(0);
  });
});
