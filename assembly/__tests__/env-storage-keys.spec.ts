// Datastore key queries as they behave from execution version 2 (MIP-0002).

import { addAddressToLedger, resetStorage } from '../vm-mock';
import { Address, Storage } from '../std';
import { selfDestruct } from '../std/solidity_compat/misc';
import { bytesToString, stringToBytes } from '@massalabs/as-types';

const MAX_DATASTORE_KEYS_PAGE = Storage.MAX_DATASTORE_KEYS_PAGE;

const otherAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

function keyName(i: i32): string {
  return 'k' + i.toString().padStart(4, '0');
}

function setKeys(n: i32): void {
  for (let i = 0; i < n; i++) {
    Storage.set(keyName(i), 'v');
  }
}

function names(keys: Array<StaticArray<u8>>): string[] {
  const out: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    out.push(bytesToString(keys[i]));
  }
  return out;
}

beforeEach(() => {
  resetStorage();
});

describe('Storage.getKeysPage', () => {
  it('chains pages with an exclusive cursor, in byte order', () => {
    // inserted in reverse order: pages must still come back sorted
    for (let i = 9; i >= 0; i--) {
      Storage.set(keyName(i), 'v');
    }
    const empty = new StaticArray<u8>(0);

    const page1 = Storage.getKeysPage(empty, empty, 4);
    expect(names(page1)).toStrictEqual(['k0000', 'k0001', 'k0002', 'k0003']);
    const page2 = Storage.getKeysPage(empty, page1[3], 4);
    expect(names(page2)).toStrictEqual(['k0004', 'k0005', 'k0006', 'k0007']);
    const page3 = Storage.getKeysPage(empty, page2[3], 4);
    expect(names(page3)).toStrictEqual(['k0008', 'k0009']);
  });

  it('orders keys by bytes, a key before its extensions', () => {
    Storage.set('b', 'v');
    Storage.set('ab', 'v');
    Storage.set('a', 'v');
    expect(names(Storage.getKeysPage())).toStrictEqual(['a', 'ab', 'b']);
  });

  it('filters by prefix', () => {
    Storage.set('user:1', 'v');
    Storage.set('user:2', 'v');
    Storage.set('other', 'v');
    const prefix = stringToBytes('user:');
    expect(names(Storage.getKeysPage(prefix))).toStrictEqual([
      'user:1',
      'user:2',
    ]);
    expect(
      names(Storage.getKeysPage(prefix, stringToBytes('user:1'))),
    ).toStrictEqual(['user:2']);
  });

  it('returns at most MAX_DATASTORE_KEYS_PAGE keys by default', () => {
    setKeys(MAX_DATASTORE_KEYS_PAGE + 20);
    const page = Storage.getKeysPage();
    expect(page.length).toBe(MAX_DATASTORE_KEYS_PAGE);
    const rest = Storage.getKeysPage(
      new StaticArray<u8>(0),
      page[page.length - 1],
    );
    expect(rest.length).toBe(20);
  });

  throws('rejects a zero page size', () => {
    Storage.getKeysPage(new StaticArray<u8>(0), new StaticArray<u8>(0), 0);
  });

  throws('rejects a page size above MAX_DATASTORE_KEYS_PAGE', () => {
    Storage.getKeysPage(
      new StaticArray<u8>(0),
      new StaticArray<u8>(0),
      MAX_DATASTORE_KEYS_PAGE + 1,
    );
  });
});

describe('Storage.getKeysOfPage', () => {
  it('reads one page of another address', () => {
    addAddressToLedger(otherAddress.toString());
    Storage.setOf(otherAddress, 'x2', 'v');
    Storage.setOf(otherAddress, 'x1', 'v');
    Storage.setOf(otherAddress, 'x3', 'v');
    const empty = new StaticArray<u8>(0);
    const page = Storage.getKeysOfPage(
      otherAddress.toString(),
      empty,
      empty,
      2,
    );
    expect(names(page)).toStrictEqual(['x1', 'x2']);
  });
});

describe('legacy Storage.getKeys', () => {
  it('returns up to MAX_DATASTORE_KEYS_PAGE keys', () => {
    setKeys(MAX_DATASTORE_KEYS_PAGE);
    expect(Storage.getKeys().length).toBe(MAX_DATASTORE_KEYS_PAGE);
  });

  throws('fails when more than MAX_DATASTORE_KEYS_PAGE keys match', () => {
    setKeys(MAX_DATASTORE_KEYS_PAGE + 1);
    Storage.getKeys();
  });
});

describe('selfDestruct', () => {
  it('deletes a datastore larger than one page', () => {
    setKeys(2 * MAX_DATASTORE_KEYS_PAGE + 7);
    selfDestruct(otherAddress);
    expect(Storage.getKeysPage().length).toBe(0);
  });
});
