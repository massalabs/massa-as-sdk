import { Address } from '../../std';
import { resetStorage } from '../../vm-mock';
import { u256 } from 'as-bignum/assembly';
import { ConstantManager } from '../constantKeyManager';
import { KeyIncrementer } from '../keyIncrementer';

beforeEach(() => {
  resetStorage();
});

describe('ConstantManager - use cases', () => {
  test('executes a basic scenario - one key', () => {
    const bins = new ConstantManager<Array<u64>>();

    bins.set([1, 2, 3, 4, 5]);

    expect(bins.mustValue()).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test('executes a basic scenario - multiple keys', () => {
    // a key manager instance is needed to generate unique keys
    const keyManager = new KeyIncrementer<u8>();
    const owner = new ConstantManager<Address>(keyManager);
    const fee = new ConstantManager<u64>(keyManager);
    const usdc = new ConstantManager<u256>(keyManager);

    owner.set(
      new Address('AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq'),
    );
    fee.set(100);
    usdc.set(u256.fromU64(1000000));

    expect(owner.mustValue().toString()).toBe(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    expect(fee.mustValue()).toBe(100);
    expect(usdc.mustValue().toString()).toBe('1000000');
  });
});

describe('ConstantManager - unit tests', () => {
  test('mustValue - key not found', () => {
    expect(() => {
      const cst = new ConstantManager<u64>();
      cst.mustValue();
    }).toThrow('Key not found');
  });

  test('tryValue - key not found', () => {
    const cst = new ConstantManager<Array<u64>>();
    expect(cst.tryValue().isErr()).toBe(true);
    expect(cst.tryValue().error).toBe('Key not found');
  });

  test('get/set - array of serializable', () => {
    const addr1 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    const addr2 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
    );

    const addresses = new ConstantManager<Array<Address>, u8, Address>();
    addresses.set([addr1, addr2]);

    expect(addresses.mustValue()).toStrictEqual([addr1, addr2]);
  });
});
