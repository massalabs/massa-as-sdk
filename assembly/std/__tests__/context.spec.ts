import { Address } from './../address';
import { callee, caller, ownedAddresses, transactionCreator } from '../context';

describe('Context', () => {
  test('test ownedAddresses', () => {
    const addresses: Address[] = ownedAddresses();
    expect(addresses.length).toBeGreaterThan(0);
  });

  test('test caller', () => {
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
});
