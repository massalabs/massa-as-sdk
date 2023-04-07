import { NoArg, bytesToString } from '@massalabs/as-types';
import {
  Address,
  call,
  callerHasWriteAccess,
  createEvent,
  createSC,
  derKeys,
  functionExists,
  generateEvent,
  getBytecode,
  getBytecodeOf,
  localCall,
  localExecution,
  transferCoins,
} from '..';
import { mockScCall } from '../..';

// Ok: 1 entry; 1st vec len = 2; data: [255, 0]
const keysSerOk1: StaticArray<u8> = [
  1, // Entry count: 1
  0,
  0,
  0,
  2, // Length of key data: 2 bytes
  255,
  0, // Key data: [255, 0]
];
const keysSerOk1ExpectedLen: i32 = 1;
const keysSerOk1ExpectedLenSub: i32 = 2;
const keysSerOk1Expected: Array<StaticArray<u8>> = [[255, 0]];

const keysSerOk2: StaticArray<u8> = [
  2, // Entry count: 1
  // 1st key
  0,
  0,
  0,
  2, // Length of key data: 2 bytes
  127,
  254, // Key data: [127, 254]
  // 2nd key
  1, // Length of key data: 1 byte
  99, // Key data: [99]
];
const keysSerOk2ExpectedLen: i32 = 2;
const keysSerOk2ExpectedLenSub1: i32 = 2;
const keysSerOk2ExpectedLenSub2: i32 = 1;

const keySerOk3: StaticArray<u8> = [
  1, // Entry count: 1
  0,
  0,
  0,
  5, // Length of key data: 5 bytes
  104,
  101,
  108,
  108,
  111, // Key data: "hello"
];

const keysSerKo8: StaticArray<u8> = []; // edge case

describe('derKeys index tests', () => {
  it('derOpKeys ok 1', () => {
    let res = derKeys(keysSerOk1);

    expect(res.length).toBe(keysSerOk1ExpectedLen);
    expect(res[0].length).toBe(keysSerOk1ExpectedLenSub);
    expect(res.toString()).toBe(keysSerOk1Expected.toString());
    expect(res[0][0]).toBe(255);
    expect(res[0][1]).toBe(0);
  });

  it('derOpKeys ok 2', () => {
    let res = derKeys(keysSerOk2);
    expect(res.length).toBe(keysSerOk2ExpectedLen);
    expect(res[0].length).toBe(keysSerOk2ExpectedLenSub1);
    expect(res[1].length).toBe(keysSerOk2ExpectedLenSub2);
    expect(res[0][0]).toBe(127);
    expect(res[0][1]).toBe(254);
    expect(res[1][0]).toBe(99);
  });

  it('derOpKeys ko 8', () => {
    let res8 = derKeys(keysSerKo8);
    expect(res8.length).toBe(0);
  });

  it('derOpKeys ok 3', () => {
    let res = derKeys(keySerOk3);
    expect(res.length).toBe(1);
    expect(res[0].length).toBe(5);
    expect(res[0][0]).toBe(104);
    expect(res[0][1]).toBe(101);
    expect(res[0][2]).toBe(108);
    expect(res[0][3]).toBe(108);
    expect(res[0][4]).toBe(111);
    expect(bytesToString(res[0])).toBe('hello');
  });
});

describe('generateEvent index tests', () => {
  it('generateEvent ok 1', () => {
    generateEvent('My event');

    expect(1).toBe(1);
  });
});

describe('createEvent index tests', () => {
  it('createEvent ok 1', () => {
    let key = 'My event';
    let values = ['value1', 'value2'];
    let newEvent = createEvent(key, values);
    let expected = 'My event:value1,value2';

    expect(newEvent).toBe(expected);
  });

  it('createEvent empty values', () => {
    let key = 'My event';
    let newEvent = createEvent(key, []);
    let expected = 'My event:';

    expect(newEvent).toBe(expected);
  });

  it('createEvent empty key', () => {
    let key = '';
    let values = ['value1', 'value2'];
    let newEvent = createEvent(key, values);
    let expected = ':value1,value2';

    expect(newEvent).toBe(expected);
  });
});

describe('functionExists index tests', () => {
  it('functionExists ok 1', () => {
    let addr = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    let res = functionExists(addr, 'dummyFunction1');
    expect(res).toBe(true);
  });

  it('functionExists ok 2', () => {
    let addr = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    let res = functionExists(addr, 'dummyFunction2');
    expect(res).toBe(true);
  });

  it('functionExists Not Exist 1', () => {
    let addr = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    let res = functionExists(addr, 'randomFictionalFunction');
    expect(res).toBe(false);
  });

  it('functionExists Not Exist 2', () => {
    let addr = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    let res = functionExists(addr, 'randomFictionalFunction');
    expect(res).toBe(false);
  });

  it('functionExists No Address', () => {
    let addr = new Address('');
    let res = functionExists(addr, 'randomFictionalFunction');
    expect(res).toBe(false);
  });

  it('functionExists No Function', () => {
    let addr = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    let res = functionExists(addr, '');
    expect(res).toBe(false);
  });
});

describe('call index tests', () => {
  it('call ok', () => {
    const addr = new Address(
      'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    const mockValue: StaticArray<u8> = [1, 2, 3];
    mockScCall(mockValue);
    const res: StaticArray<u8> = call(addr, 'someFunc', NoArg, 0);
    const expected: StaticArray<u8> = [1, 2, 3];
    expect(res).toStrictEqual(expected);
  });

  it('call not ok', () => {
    expect((): void => {
      call(
        new Address('A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT'),
        'someFunc',
        NoArg,
        0,
      );
      return;
    }).toThrow(`No mock defined for sc call on "someFunc".`);
  });
});

describe('localCall index tests', () => {
  it('localCall ok', () => {
    const addr = new Address(
      'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    const mockValue: StaticArray<u8> = [1, 2, 3];
    mockScCall(mockValue);
    const res: StaticArray<u8> = localCall(addr, 'someFunc', NoArg);
    const expected: StaticArray<u8> = [1, 2, 3];
    expect(res).toStrictEqual(expected);
  });

  it('localCall not ok', () => {
    expect((): void => {
      localCall(
        new Address('A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT'),
        'someFunc',
        NoArg,
      );
      return;
    }).toThrow(`No mock defined for sc call on "someFunc".`);
  });
});

describe('localExecution index tests', () => {
  it('localExecution ok', () => {
    const mockValue: StaticArray<u8> = [1, 2, 3];
    mockScCall(mockValue);
    const res: StaticArray<u8> = localExecution([], 'someFunc', NoArg);
    const expected: StaticArray<u8> = [1, 2, 3];
    expect(res).toStrictEqual(expected);
  });

  it('localExecution not ok', () => {
    expect((): void => {
      localExecution([], 'someFunc', NoArg);
      return;
    }).toThrow(`No mock defined for sc call on "someFunc".`);
  });
});

describe('getByteCode index tests', () => {
  it('getByteCode ok', () => {
    const res = getBytecode();
    const expected = new StaticArray<u8>(0);
    expect(res).toStrictEqual(expected);
  });

  it('getByteCodeOf ok', () => {
    const res = getBytecodeOf(
      new Address('A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT'),
    );
    const expected = new StaticArray<u8>(0);
    expect(res).toStrictEqual(expected);
  });
});

describe('callerHasWriteAccess index tests', () => {
  it('callerHasWriteAccess not ok', () => {
    const res = callerHasWriteAccess();
    expect(res).toStrictEqual(false);
  });
});

describe('createSC index tests', () => {
  it('createSC ok', () => {
    const res = (): void => {
      createSC([]);
    };
    expect(res).not.toThrow('Cannot create a smart contract with no bytecode');
  });
});

describe('transferCoins index tests', () => {
  it('transferCoins ok', () => {
    const func = (): void => {
      transferCoins(
        new Address('A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT'),
        12,
      );
      return;
    };
    expect(func).not.toThrow('Cannot transfer negative amount of coins');
    expect(func).not.toThrow('Inssuficient funds');
  });
});
