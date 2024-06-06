/* eslint-disable max-len */
import {
  Address,
  Storage,
  generateEvent,
  Context,
  sha256,
  getKeysOf,
  validateAddress,
  keccak256,
  isEvmSignatureValid,
  evmGetPubkeyFromSignature,
  getOriginOperationId,
  balance,
  balanceOf,
  transferCoins,
  call,
} from '../std';
import { changeCallStack, resetStorage } from '../vm-mock/storage';
import {
  mockAdminContext,
  mockBalance,
  mockOriginOperationId,
  mockScCall,
  mockSetChainId,
  mockTransferredCoins,
  setDeployContext,
  setLocalContext,
} from '../vm-mock/env';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';
import { env } from '../env/index';
import { callee, caller, isDeployingContract } from '../std/context';
import { hexStringToStaticArray, staticArrayToHexString } from './utils';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);
const badAddress = new Address(
  'ALé2E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

const testAddress2 = new Address(
  'AS12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oP',
);

const callerAddress: Address = new Address(
  'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
);

const contractAddress: Address = new Address(
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
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
    const hash = sha256(stringToBytes('something'));
    expect(staticArrayToHexString(hash)).toBe(
      '3fc9b689459d738f8c88a3a48aa9e33542016b7a4052e001aaa536fca74813cb',
    );
  });

  test('Testing keccak256', () => {
    const hash = keccak256(
      stringToBytes('The quick brown fox jumps over the lazy dog'),
    );
    expect(hash).toStrictEqual([
      77, 116, 27, 111, 30, 178, 156, 178, 169, 185, 145, 28, 130, 245, 111,
      168, 215, 59, 4, 149, 157, 61, 157, 34, 40, 149, 223, 108, 11, 40, 170,
      21,
    ]);

    expect(staticArrayToHexString(hash)).toBe(
      '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15',
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
    mockAdminContext(false);
    changeCallStack(
      callerAddress.toString() + ' , ' + contractAddress.toString(),
    );
  });

  afterAll(() => {
    mockAdminContext(false);
    changeCallStack(
      callerAddress.toString() + ' , ' + contractAddress.toString(),
    );
  });

  it('should return false when caller has no write access', () => {
    expect(env.callerHasWriteAccess()).toStrictEqual(false);
  });

  it('should return true when caller has write access as an admin', () => {
    mockAdminContext(true);
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
  });

  it('should return true for write access when caller is an admin and false when caller is a non-admin', () => {
    mockAdminContext(true);
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
    mockAdminContext(false);
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

  it('should update the caller address', () => {
    const deployerAddr = 'AS12BqZEQ6sByNCALLER';
    setDeployContext(deployerAddr);

    expect(caller()).toStrictEqual(new Address(deployerAddr));
    expect(callee()).toStrictEqual(contractAddress);
  });

  it('should give a random distinct value to callerAddress when deploy context is set', () => {
    setDeployContext();

    expect(caller()).not.toStrictEqual(callee());
  });

  it('should not change the contract address when changing to deploy context', () => {
    expect(callee()).toStrictEqual(contractAddress);
    expect(caller()).toStrictEqual(callerAddress);

    setDeployContext();

    expect(caller()).toStrictEqual(callerAddress);
    expect(callee()).toStrictEqual(contractAddress);
  });

  it('should give write access when changing to local context', () => {
    setLocalContext();
    expect(env.callerHasWriteAccess()).toStrictEqual(true);
  });

  it('should not be in deploying context when local context is set', () => {
    setLocalContext();
    expect(isDeployingContract()).toStrictEqual(false);
  });

  it('should change the call stack according to the passed parameter when changing to local context', () => {
    setLocalContext('AS12BqZEQ6sByNCALLER');

    expect(caller()).toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
    expect(callee()).toStrictEqual(new Address('AS12BqZEQ6sByNCALLER'));
  });

  it('should give the same random value to both address in call stack when changing to local context', () => {
    setLocalContext();

    expect(caller().toString()).toStrictEqual(callee().toString());
  });

  it('should verify evm signature', () => {
    const data = stringToBytes('Hello World');
    const signature = hexStringToStaticArray(
      '1617966ef37eaff4312132243df65cfb66ccda057e996b586f910d6eb422787453b0a8465be9716493650d6706bc84efe85a5d76a0111c89d0cdf8ba57e510571c',
    );
    // secp256k1 raw public key (compression header byte has been removed)
    const publicKey = hexStringToStaticArray(
      'ae04a0fb4545138d22ed46eee76e683c50412ffb8cb02ee8fa5a5c8eec35f72dc076cb1b7468f8cacf136a7e0609b31ed580746d8efc659a993ccd695d6387ff',
    );

    expect(isEvmSignatureValid(data, signature, publicKey)).toStrictEqual(true);
  });

  it('should get evm public key from signature', () => {
    const digest = hexStringToStaticArray(
      'a1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2',
    );
    const signature = hexStringToStaticArray(
      '1617966ef37eaff4312132243df65cfb66ccda057e996b586f910d6eb422787453b0a8465be9716493650d6706bc84efe85a5d76a0111c89d0cdf8ba57e510571c',
    );
    // secp256k1 public key (with compression header byte)
    const publicKey = hexStringToStaticArray(
      '04ae04a0fb4545138d22ed46eee76e683c50412ffb8cb02ee8fa5a5c8eec35f72dc076cb1b7468f8cacf136a7e0609b31ed580746d8efc659a993ccd695d6387ff',
    );

    expect(evmGetPubkeyFromSignature(digest, signature)).toStrictEqual(
      publicKey,
    );
  });
});

describe('Testing mocked Chain id', () => {
  beforeEach(() => {
    mockSetChainId(9_000_000);
  });

  afterAll(() => {
    mockSetChainId(77);
  });

  it('chain id mock value', () => {
    expect(env.chainId()).toBe(9_000_000);
  });
});

describe('Testing mocked origin operation id', () => {
  const mockedOpId = 'imAniceOpId';
  beforeEach(() => {
    mockOriginOperationId(mockedOpId);
  });

  it('operation Id is mocked', () => {
    const opId = getOriginOperationId();
    expect(opId).toBe(mockedOpId);
  });

  it('operation Id mock is unset', () => {
    mockOriginOperationId('');
    const opId = getOriginOperationId();
    expect(opId).not.toBe(mockedOpId);
  });
});

describe('balance mock', () => {
  afterEach(() => {
    resetStorage();
  });

  it('mock user balance', () => {
    const amount = 54331;
    mockBalance(testAddress.toString(), amount);
    expect(balanceOf(testAddress.toString())).toBe(amount);
  });

  it('mock contract balance', () => {
    const amount = 5433109876;
    mockBalance(contractAddress.toString(), amount);
    expect(balance()).toBe(amount);
    expect(balanceOf(contractAddress.toString())).toBe(amount);
  });

  it('mock contract balance with transferred coins', () => {
    const amount = 1234567;
    const callCoins = 888;
    mockTransferredCoins(callCoins);
    mockBalance(contractAddress.toString(), amount);
    expect(balance()).toBe(callCoins + amount);
    expect(balanceOf(contractAddress.toString())).toBe(callCoins + amount);
  });

  it('mock contract balance and preserve storage', () => {
    const amount = 12345671234;
    Storage.set('thekey', 'thevalue');
    mockBalance(contractAddress.toString(), amount);
    expect(balance()).toBe(amount);
    expect(Storage.get('thekey')).toBe('thevalue');
  });
});

describe('transfer coins', () => {
  afterEach(() => {
    resetStorage();
  });

  const amount = 666;
  it('contract transfer amount to user', () => {
    const initialContractBalance = 987654321;
    mockBalance(contractAddress.toString(), initialContractBalance);

    transferCoins(testAddress, amount);
    expect(balanceOf(testAddress.toString())).toBe(amount);
    expect(balance()).toBe(initialContractBalance - amount);
    expect(balanceOf(contractAddress.toString())).toBe(
      initialContractBalance - amount,
    );
  });

  it('contract transfer amount to user with initial balance', () => {
    const initialUserBalance = 123;
    mockBalance(testAddress.toString(), initialUserBalance);

    const initialContractBalance = 1234567;
    mockBalance(contractAddress.toString(), initialContractBalance);

    transferCoins(testAddress, amount);
    expect(balanceOf(testAddress.toString())).toBe(amount + initialUserBalance);
    expect(balance()).toBe(initialContractBalance - amount);
    expect(balanceOf(contractAddress.toString())).toBe(
      initialContractBalance - amount,
    );
  });

  it('contract transfer amount to user with initial balance and transferred coin', () => {
    const initialCallerBalance = 300000;
    mockBalance(caller().toString(), initialCallerBalance);

    const initialUserBalance = 123;
    mockBalance(testAddress.toString(), initialUserBalance);

    const initialContractBalance = 333333333333;
    mockBalance(contractAddress.toString(), initialContractBalance);

    const callCoins = 222;
    mockTransferredCoins(callCoins);

    transferCoins(testAddress, amount);
    // caller balance should be reduced by transferred coins
    expect(balanceOf(caller().toString())).toBe(
      initialCallerBalance - callCoins,
    );
    // user balance should be increased by the transferred coins
    expect(balanceOf(testAddress.toString())).toBe(amount + initialUserBalance);
    // contract balance should be reduced by the transferred coins
    expect(balance()).toBe(initialContractBalance - amount + callCoins);
    expect(balanceOf(contractAddress.toString())).toBe(
      initialContractBalance - amount + callCoins,
    );
  });

  throws('throw if insufficient balance', () => {
    mockBalance(contractAddress.toString(), 0);
    expect(balance()).toBe(0);
    transferCoins(testAddress, amount);
  });

  it('Use the caller transferred coins to process the transfer', () => {
    mockBalance(contractAddress.toString(), 0);
    expect(balance()).toBe(0);
    mockTransferredCoins(amount);
    expect(balance()).toBe(amount);
    transferCoins(testAddress, amount);
    expect(balance()).toBe(0);
  });
});

describe('Callee balance', () => {
  afterEach(() => {
    resetStorage();
  });

  it('Contract balance must be updated after internal SC call', () => {
    const amount = 666;
    mockBalance(contractAddress.toString(), amount);
    expect(balance()).toBe(amount);
    mockScCall([]);
    call(new Address(), 'targetFn', new Args(), amount);
    expect(balance()).toBe(0);
    expect(balanceOf(contractAddress.toString())).toBe(0);
  });
});
