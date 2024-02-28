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
import { validateAddress, json2Address } from '../utils';
import { mockTransferredCoins } from '../../vm-mock';

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
    mockTransferredCoins(100);
    expect(transferredCoins()).toBe(100);
    mockTransferredCoins(0);
  });

  test('isDeployingContract', () => {
    expect(isDeployingContract()).toBe(false);
  });

  test('timestamp', () => {
    const time = timestamp();
    expect(time).toBeGreaterThan(0);
  });

  test('json2Address', () => {
    const jsonString = '["address1","address2","address3"]';
    const expectedOutput = [
      new Address('address1'),
      new Address('address2'),
      new Address('address3'),
    ];

    const result = json2Address(jsonString);

    expect(result.length).toBe(expectedOutput.length);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBe(expectedOutput[i]);
    }
  });
});
