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

describe('Context', () => {
  test('ownedAddresses', () => {
    const addresses: Address[] = ownedAddresses();
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses[0].isValid()).toBe(true);
  });

  test('caller', () => {
    const address: Address = caller();
    expect(address.isValid()).toBe(true);
  });

  test('callee', () => {
    const address: Address = callee();
    expect(address.isValid()).toBe(true);
  });

  test('transactionCreator', () => {
    const address: Address = transactionCreator();
    expect(address.isValid()).toBe(true);
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
