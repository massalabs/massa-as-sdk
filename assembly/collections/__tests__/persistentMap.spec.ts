import { PersistentMap } from '../persistentMap';
import { Address } from '../../std';

describe('Persistent Map tests', () => {
  it('empty map', () => {
    const map = new PersistentMap<string, string>('my_map');
    expect<number>(map.size()).toBe(0, 'empty map must have 0 size');
    expect(map.contains('some_key')).toBeFalsy('empty map contains no keys');
    expect<string | null>(map.get('some_key')).toBeNull(
      'empty map contains no keys',
    );
  });

  it('basic map operations', () => {
    const map = new PersistentMap<string, string>('my_map');

    // test key-value pair
    const key: string = 'some_key';
    const value: string = 'some_value';

    // set a value
    const setResult0 = map.set(key, value);
    expect(setResult0.isOk()).toBeTruthy('set should be OK');

    // check map size
    expect<number>(map.size()).toBe(1, 'size must be 1');

    // check for value
    expect(map.contains(key)).toBeTruthy('must contain key');

    // get value
    expect<string | null>(map.get(key)).toStrictEqual(value);

    // replace value
    const updatedValue: string = value.toUpperCase();
    const setResult = map.set(key, updatedValue);
    expect(setResult.isOk()).toBeTruthy('set should be OK');

    // check for value
    expect<string | null>(map.get(key)).toStrictEqual(updatedValue);

    // check for value
    expect(map.contains(key)).toBeTruthy('must contain key');

    // check map size
    expect<number>(map.size()).toBe(1, 'size must be 1');

    // add another key now
    const key2 = 'some_other_key';
    const setResult2 = map.set(key2, updatedValue);
    expect(setResult2.isOk()).toBeTruthy('set should be OK');

    // check map size again
    expect<number>(map.size()).toBe(2, 'size must be 2');

    // delete value
    map.delete(key);

    // check map size again
    expect<number>(map.size()).toBe(1, 'size must be 1');

    // key should not be there anymore
    expect<string | null>(map.get('some_key')).toBeNull(
      'key must have been deleted',
    );
  });

  it('uint8 values', () => {
    const map = new PersistentMap<string, Uint8Array>('my_map');
    let key = 'key';
    const testArr = new Uint8Array(10);
    for (let i = 0; i < testArr.length; i++) {
      testArr[i] = 255;
    }
    const setResult = map.set(key, testArr);
    expect(setResult.isOk()).toBeTruthy('set should be OK');
    expect<number>(map.size()).toBe(1, 'size must be 1');
    const value: Uint8Array = map.get(key) as Uint8Array;
    expect<Uint8Array | null>(value).not.toBeNull(
      'retrieved value must not be null',
    );
    expect<Uint8Array | null>(map.get(key)).toStrictEqual(testArr);
    let isU8Set = true;
    for (let i = 0; i < value.length; i++) {
      if (testArr[i] !== 255) {
        isU8Set = false;
      }
    }
    expect(isU8Set).toBeTruthy('expected an array of u8s of 255');
  });
  it('StaticArray<u8> values', () => {
    const map = new PersistentMap<string, StaticArray<u8>>('my');
    let key = 'key';
    let _value: Array<u8> = [1, 2, 3, 254, 255];
    let value = StaticArray.fromArray(_value);

    // set
    const setResult = map.set(key, value);
    expect(setResult.isOk()).toBeTruthy('set should be OK');
    expect<number>(map.size()).toBe(1, 'size must be 1');

    // get
    const got = map.get(key);
    expect<StaticArray<u8> | null>(got).not.toBeNull(
      'retrieved value must not be null',
    );
    expect<StaticArray<u8> | null>(map.get(key)).toStrictEqual(value);
  });
  it('Serializable values', () => {
    const map = new PersistentMap<string, Address>('REG');
    let keyA = 'addrA';
    let keyB = 'addrB';
    let keyC = 'adDrC';

    let valueA = new Address();
    let valueB = new Address('01');

    // set
    const setResult = map.set(keyA, valueA);
    expect(setResult.isOk()).toBeTruthy('set should be OK');
    expect<number>(map.size()).toBe(1, 'size must be 1');
    const setResultB = map.set(keyB, valueB);
    expect(setResultB.isOk()).toBeTruthy('set should be OK');
    expect<number>(map.size()).toBe(2, 'size must be 2');

    // get
    const got = map.get(keyA, new Address());
    expect<Address | null>(got).not.toBeNull(
      'retrieved value must not be null',
    );
    expect<Address | null>(map.get(keyA, new Address())).toStrictEqual(valueA);
    expect<Address>(map.getSome(keyA, new Address()).unwrap()).toStrictEqual(
      valueA,
    );
    expect<Address | null>(map.get(keyB, new Address())).toStrictEqual(valueB);
    expect<Address>(map.getSome(keyB, new Address()).unwrap()).toStrictEqual(
      valueB,
    );

    // expect<Address>(map.getSome(keyC, new Address())).toStrictEqual(valueB);
    // expect<Address | null>(map.get(keyC, new Address())).toStrictEqual(new Address());
    expect<Address | null>(map.get(keyC, new Address())).toStrictEqual(
      new Address(),
    );
    let res = map.getSome(keyC, new Address());
    assert(res.isErr(), 'getSome for keyC should return a Result in error');
  });
});
