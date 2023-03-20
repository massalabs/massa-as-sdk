import { Address } from './../address';
import { caller, ownedAddresses } from '../context';

describe('Context', () => {
  test('test ownedAddresses', () => {
    const addresses: Address[] = ownedAddresses();
    expect(addresses.length).toBeGreaterThan(0);
  });

  test('test caller', () => {
    const address: Address = caller();
    expect(address.isValid()).toBe(true);
  });
});
