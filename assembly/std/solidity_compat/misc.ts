import { u256 } from 'as-bignum/assembly';
import { wrapStaticArray } from '@massalabs/as-types';
import { Address } from '../address';
import { env } from '../../env';
// import setBytecode = env.setBytecode;
// import getKeys = env.getKeys;
import { Storage } from '../index';

// Convert bytes array (length 32) to u256
// In Solidity, you can see code like:
// (uint8 v, bytes32 r, bytes32 s) = ...
// if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
//     revert ECDSAInvalidSignatureS();
// }
export function bytes32ToU256(a: StaticArray<u8>): u256 {
  return u256.fromUint8ArrayBE(wrapStaticArray(a));
}

// implementation Solidity selfdestruct:
// https://www.infuy.com/blog/using-self-destruct-in-solidity-contracts/
// Note: this function will try to delete all Storage keys. Devs might want to clean things up manually
//       before using this function.
export function selfDestruct(transferToAddr: Address): void {
  // 1- empty the SC
  let emptySc = new StaticArray<u8>(0);
  env.setBytecode(emptySc);

  // 2- delete everything in Storage
  let keys = Storage.getKeys(new StaticArray<u8>(0));
  for (let i = 0; i < keys.length; i++) {
    Storage.del(keys[i]);
  }

  // 3- transfer back coins if any
  let scBalance = env.balance();
  // Balance will most likely be > 0 as we deleted some keys from the Storage
  // but if there is nothing in the Storage, no need to call transferCoins
  if (scBalance > 0) {
    env.transferCoins(transferToAddr.toString(), scBalance);
  }
}
