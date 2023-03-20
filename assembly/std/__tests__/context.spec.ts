import { Address } from './../address';
import { ownedAddresses } from '../context';

describe('Context', () => {
  test('test ownedAddresses', () => {
    const result: Address[] = ownedAddresses();
    expect(result.length).toBeGreaterThan(0);
  });
});
