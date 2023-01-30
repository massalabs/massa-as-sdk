import { Address, Storage, generateEvent, Context } from '../std';
import { resetStorage } from '../vm-mock/storage';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';

const testAddress = new Address(
  'A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

const keyTest = 'test';
const valueTest = 'value';

const keyTestArgs = new Args().add(keyTest);
const valueTestArgs = new Args().add(valueTest);

beforeEach(() => {
  resetStorage();
});

describe('Testing mocked Storage and CallStack', () => {
  test('Testing the callstack', () => {
    // By convention addressStack returns always the two addresses.
    const callStack = Context.addressStack();

    // expect to get the caller address in vm-mock/vm.js
    expect(callStack[0].toString()).toBe(
      'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );

    // expect to get the contract address in vm-mock/vm.js
    expect(callStack[1].toString()).toBe(
      'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
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
});
