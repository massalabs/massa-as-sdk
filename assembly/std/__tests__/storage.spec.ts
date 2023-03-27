import { Storage } from '..';
import { Args } from '@massalabs/as-types';

/**
 * The following section contains a set of tests that follow a "test as documentation" strategy, making them easier
 * to read and understand. These tests are organized in a way that serves as documentation, and each test is designed
 * to demonstrate a specific aspect of the code's behavior.
 */

describe('Storage tests', () => {
  it('checks the set command', () => {
    Storage.set(new StaticArray<u8>(0), new StaticArray<u8>(0));
    Storage.set('1', '1');
    Storage.set(new Args(), new Args());

    // TODO: Define and implement how to test that.
    // Storage.set(new Uint8Array(0), new Uint8Array(0)); // doesn't compile with user error as expected.
  });

  it('checks the get command', () => {
    Storage.get(new StaticArray<u8>(0));
    Storage.get('1');
    Storage.get(new Args());

    // TODO: Define and implement how to test that.
    // Storage.get(new Uint8Array(0)); // doesn't compile with user error as expected.
  });

  it('checks the set/get commands', () => {
    const keyArr: StaticArray<u8> = [1, 2, 3, 4];
    const valueArr: StaticArray<u8> = [5, 6, 7, 8];

    Storage.set(keyArr, valueArr);
    expect(Storage.get(keyArr)).toStrictEqual(valueArr);

    const keyString = 'ABCD';
    const keyValue = 'EFGH';

    Storage.set(keyString, keyValue);
    expect(Storage.get(keyString)).toBe(keyValue);

    const keyArgs = new Args().add(u64(1));
    const valueArgs = new Args().add(u64.MAX_VALUE);

    Storage.set(keyArgs, valueArgs);
    expect(Storage.get(keyArgs)).toStrictEqual(valueArgs);
  });
});

/**
 * The following section contains table tests that are not organized according to the "test as documentation" strategy
 * used above, which may make them more difficult to read and understand. These tests are still important for ensuring
 * the correctness of the code and should not be skipped.
 */

const keyArr: StaticArray<u8> = [1, 2, 3, 4];
const valueArr: StaticArray<u8> = [5, 6, 7, 8];

// prettier-ignore
verifyTableExpectations(
  'set/get command',
  () => {
    Storage.set(row0, row1);
    expect(Storage.get(row0)).toStrictEqual(row1, row2);
  },
  [
    // <storage key>, <storage value>, <test description>,
    "key", "value", "storing string",
    new Args().add(u64(1)), new Args().add(u64.MAX_VALUE), "storing args",
    keyArr, valueArr, "storing array",
  ]
);
