import {
  Address,
  Storage,
  generateEvent,
  Context,
  sha256,
  getKeysOf,
  validateAddress,
} from '../std';
import { changeCallStack, resetStorage } from '../vm-mock/storage';
import {
  mockAdminContext,
  setDeployContext,
  mockNonAdminContext,
  setLocalContext,
} from '../vm-mock/env';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';
import { env } from '../env/index';
import { callee, caller, isDeployingContract } from '../std/context';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);
const badAddress = new Address(
  'ALé2E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

const testAddress2 = new Address(
  'AS12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oP',
);

const keyTest = 'test';
const valueTest = 'value';

const keyTestArgs = new Args().add(keyTest);
const valueTestArgs = new Args().add(valueTest);

const addressesArray: Address[] = [testAddress, testAddress2];

beforeEach(() => {
  resetStorage();
});

describe('Testing mocked Storage and CallStack', () => {
  test('Testing the callstack', () => {
    // By convention addressStack returns always the two addresses.
    const callStack = Context.addressStack();

    // expect to get the caller address in vm-mock/vm.js
    expect(callStack[0].toString()).toBe(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );

    // expect to get the contract address in vm-mock/vm.js
    expect(callStack[1].toString()).toBe(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
  });

  test('Testing the Storage setOf in bytes', () => {
    Storage.setOf(testAddress, keyTest, valueTest);
    expect(
      bytesToString(Storage.getOf(testAddress, stringToBytes(keyTest))),
    ).toBe(valueTest);
  });

  test('Testing the Storage setOf with Args', () => {
    Storage.setOf(testAddress, keyTestArgs, valueTestArgs);
    expect(Storage.getOf(testAddress, keyTestArgs).nextString().unwrap()).toBe(
      valueTest,
    );
  });

  test('Testing the Storage setOf with Args containing an array of addresses', () => {
    const argsAddresses = new Args().addSerializableObjectArray(addressesArray);
    Storage.setOf(testAddress, keyTestArgs, argsAddresses);
    expect<Address[]>(
      Storage.getOf(testAddress, keyTestArgs)
        .nextSerializableObjectArray<Address>()
        .unwrap(),
    ).toStrictEqual(addressesArray);
  });

  test('Testing the Storage get', () => {
    Storage.set(keyTest, valueTest);
    expect(Storage.get(keyTest)).toBe(valueTest);
  });

  test('Testing the Storage has', () => {
    Storage.set(keyTest, valueTest);
    expect(Storage.has(keyTest)).toBeTruthy();
  });

  test('Testing the Storage hasOf', () => {
    Storage.setOf(testAddress, keyTest, valueTest);
    expect(Storage.hasOf(testAddress, keyTest)).toBeTruthy();
  });

  test('Testing event', () => {
    generateEvent("I'm an event ");
  });

  test('Testing sha256', () => {
    const result = bytesToString(sha256(stringToBytes('something')));
    expect(result).toBe(
      '3fc9b689459d738f8c88a3a48aa9e33542016b7a4052e001aaa536fca74813cb',
    );
  });

  test('Testing getKeysOf', () => {
    Storage.setOf(testAddress, keyTest, valueTest);
    Storage.setOf(testAddress, 'test2', valueTest);
    Storage.setOf(testAddress, 'test3', valueTest);
    Storage.setOf(testAddress, 'test4', valueTest);

    const keys = getKeysOf(testAddress.toString());
    expect(keys.length).toBe(4);
    expect(bytesToString(keys[0])).toBe(keyTest);
    expect(bytesToString(keys[1])).toBe('test2');
    expect(bytesToString(keys[2])).toBe('test3');
    expect(bytesToString(keys[3])).toBe('test4');
  });

  test('Testing getKeys', () => {
    resetStorage();
    changeCallStack(testAddress.toString() + ' , ' + testAddress2.toString());

    Storage.setOf(testAddress, 'test1', valueTest);
    Storage.setOf(testAddress, 'test2', valueTest);

    const keys = getKeysOf(testAddress.toString());

    expect(keys.length).toBe(2);

    expect(bytesToString(keys[0])).toBe('test1');
    expect(bytesToString(keys[1])).toBe('test2');
  });

  test('Testing validateAddress', () => {
    const result = validateAddress(testAddress.toString());
    expect(result).toBe(true);

    const result2 = validateAddress(badAddress.toString());
    expect(result2).toBe(false);
  });
});

describe('Testing mocked Context', () => {
  beforeEach(() => {
    mockNonAdminContext();
    changeCallStack(testAddress.toString() + ' , ' + testAddress2.toString());
  });

  afterAll(() => {
    mockNonAdminContext();
    changeCallStack(testAddress.toString() + ' , ' + testAddress2.toString());
  });

  it('should return false when caller has no write access', () => {
    expect(env.callerHasWriteAccess()).toStrictEqual(false);
  });

  it('should return true when caller has write access as an admin', () => {
    mockAdminContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
  });

  it('should return true for write access when caller is an admin and false when caller is a non-admin', () => {
    mockAdminContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
    mockNonAdminContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(false);
  });

  it('should return true for write access when using deploy context', () => {
    setDeployContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
  });

  it('should return true for isDeployingContract when deploy context mock is set', () => {
    setDeployContext();
    expect(isDeployingContract()).toStrictEqual(true);
  });

  it('should set the same address for caller and callee when deploy context is set', () => {
    setDeployContext('AS12BqZEQ6sByNCALLER');

    expect(caller()).toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
    expect(callee()).not.toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
  });

  test('Test deploy context random ok values', () => {
    setDeployContext();
    const callerAddress = caller();
    const calleeAddress = callee();

    expect(callerAddress).not.toStrictEqual(calleeAddress);
  });

  test('Test deploy context no contract Address changes', () => {
    setDeployContext();
    const callerAddress = caller();
    const calleeAddress = callee();

    expect(callerAddress).not.toStrictEqual(calleeAddress);
  });

  test('Test local context gives write access', () => {
    setLocalContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
  });

  test('Test local context not deploying', () => {
    setLocalContext();
    expect(isDeployingContract()).toStrictEqual(false);
  });

  test('Test local context changes call stack', () => {
    setLocalContext('AS12BqZEQ6sByNCALLER');

    expect(caller()).toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
    expect(callee()).toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
  });

  test('Test local context random ok values', () => {
    setLocalContext();
    const callerAddress = caller();
    const calleeAddress = callee();

    expect(callerAddress.toString()).toStrictEqual(calleeAddress.toString());
  });
});
