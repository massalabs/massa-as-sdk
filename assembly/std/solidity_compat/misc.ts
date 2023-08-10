import { u256 } from 'as-bignum/assembly';
import { wrapStaticArray } from '@massalabs/as-types';

// Convert bytes array (length 32) to u256
// In Solidity, you can see code like:
// (uint8 v, bytes32 r, bytes32 s) = ...
// if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
//     revert ECDSAInvalidSignatureS();
// }
export function bytes32ToU256(a: StaticArray<u8>): u256 {
  return u256.fromUint8ArrayBE(wrapStaticArray(a));
}
