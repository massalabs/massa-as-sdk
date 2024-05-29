import { Address } from '../../std';
import { resetStorage } from '../../vm-mock';
import { KeyIncrementer } from '../keyIncrementer';
import { MapManager } from '../mapKeyManager';
import { Args } from '@massalabs/as-types';

beforeEach(() => {
  resetStorage();
});

describe('MapManager - use cases', () => {
  test('executes a basic scenario - simple', () => {
    const addr1 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    const addr2 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
    );
    const balance = new MapManager<Address, u64>();
    balance.set(addr1, 100);
    balance.set(addr2, 200);

    expect(balance.mustValue(addr1)).toBe(100);
    expect(balance.mustValue(addr2)).toBe(200);
    expect<u64>(
      balance
        .value(
          new Address('AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKs'),
        )
        .unwrapOrDefault(),
    ).toBe(0);
  });

  test('executes a basic scenario - complex', () => {
    const addr1 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    const addr2 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
    );

    const keyer = new KeyIncrementer<u8>();
    const balance = new MapManager<Address, u64>(keyer);
    const allowance = new MapManager<StaticArray<u8>, u64>(keyer);

    balance.set(addr1, 100);
    balance.set(addr2, 200);

    const allowanceKey = new Args().add(addr1).add(addr2).serialize();
    allowance.set(allowanceKey, 100);

    expect(balance.mustValue(addr1)).toBe(100);
    expect(balance.mustValue(addr2)).toBe(200);
    expect(allowance.mustValue(allowanceKey)).toBe(100);
    expect<u64>(
      allowance
        .value(new Args().add(addr1).add(addr1).serialize())
        .unwrapOrDefault(),
    ).toBe(0);
  });
});

describe('ConstantManager - unit tests', () => {
  test('mustValue - key not found', () => {
    expect(() => {
      const m = new MapManager<u64, u64>();
      m.mustValue(1);
    }).toThrow('Key not found');
  });

  test('tryValue', () => {
    const m = new MapManager<Array<u64>, Array<u64>>();
    m.set([0], [1, 2, 3]);
    expect<u64[]>(m.value([0]).unwrap()).toStrictEqual([1, 2, 3]);
    expect(m.value([1]).isErr()).toBe(true);
    expect(m.value([1]).error).toBe('Key not found');
    expect<u64[]>(m.value([1]).unwrapOrDefault()).toStrictEqual([]);
  });

  test('get/set - array of serializable', () => {
    const addr1 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    const addr2 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
    );

    const addresses = new MapManager<u64, Array<Address>, u8, Address>();
    addresses.set(1, [addr1, addr2]);

    expect(addresses.mustValue(1)).toStrictEqual([addr1, addr2]);
    expect(addresses.value(2).unwrapOrDefault()).toStrictEqual([]);
  });
});
