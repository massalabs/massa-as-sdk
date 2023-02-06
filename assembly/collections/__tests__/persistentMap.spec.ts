import { PersistentMap } from '../persistentMap';

describe('Persistent Map tests', () => {
  it('empty map', () => {
    const map = new PersistentMap<string, string>('my_map');
    assert<bool>(map.size() === 0, 'empty map must have 0 size');
    assert<bool>(!map.contains('some_key'), 'empty map contains no keys');
    assert<bool>(!map.get('some_key'), 'empty map contains no keys');
  });

  it('basic map operations', () => {
    const map = new PersistentMap<string, string>('my_map');

    // test key-value pair
    const key: string = 'some_key';
    const value: string = 'some_value';

    // set a value
    const setResult0 = map.set(key, value);
    assert<bool>(setResult0.isOk(), `set should be OK`);

    // check map size
    assert<bool>(map.size() === 1, 'size must be 1');

    // check for value
    assert<bool>(map.contains(key), 'must contain key');

    // get value
    assert<string>(map.get(key) as string, value);

    // replace value
    const updatedValue: string = value.toUpperCase();
    const setResult = map.set(key, updatedValue);
    assert<bool>(setResult.isOk(), `set should be OK`);

    // check for value
    assert<string>(map.get(key) as string, updatedValue);

    // check for value
    assert<bool>(map.contains(key), 'must contain key');

    // check map size
    assert<bool>(map.size() === 1, 'size must be 1');

    // add another key now
    const key2 = 'some_other_key';
    const setResult2 = map.set(key2, updatedValue);
    assert<bool>(setResult2.isOk(), `set should be OK`);

    // check map size again
    assert<bool>(map.size() === 2, 'size must be 2');

    // delete value
    map.delete(key);

    // check map size again
    assert<bool>(map.size() === 1, 'size must be 1');

    // key should not be there anymore
    assert<bool>(!map.get(key), `key must have been deleted`);
  });

  it('uint8 values', () => {
    const map = new PersistentMap<string, Uint8Array>('my_map');
    let key = 'key';
    const testArr = new Uint8Array(10);
    for (let i = 0; i < testArr.length; i++) {
      testArr[i] = 255;
    }
    const setResult = map.set(key, testArr);
    assert<bool>(setResult.isOk(), `set should be OK`);
    assert<bool>(map.size() === 1, 'size must be 1');
    const value: Uint8Array = map.get(key) as Uint8Array;
    assert<bool>(value !== null, 'retrieved value must not be null');
    let isU8Set = true;
    for (let i = 0; i < value.length; i++) {
      if (testArr[i] !== 255) {
        isU8Set = false;
      }
    }
    assert<bool>(isU8Set, `expected an array of u8s of 255`);
  });
});
