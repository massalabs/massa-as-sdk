import { u256 } from 'as-bignum/assembly';
import { bytes32ToU256 } from '../solidity_compat/misc';

describe('bytes32 -> u256', () => {
  it('test 1', () => {
    let _val0_: Array<u8> = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1,
    ];
    let _val0 = StaticArray.fromArray(_val0_);
    let val0 = bytes32ToU256(_val0);

    assert(val0 == u256.One);

    // Solidity:
    // 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
    // python3:
    // l1 = bytearray.fromhex("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0");
    // print(list(l1))
    let _val1_: Array<u8> = [
      127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 93, 87, 110, 115, 87, 164, 80, 29, 223, 233, 47, 70, 104, 27, 32,
      160,
    ];
    let _val1 = StaticArray.fromArray(_val1_);
    let val1 = bytes32ToU256(_val1);

    // +1
    let _val2_: Array<u8> = [
      127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 93, 87, 110, 115, 87, 164, 80, 29, 223, 233, 47, 70, 104, 27, 32,
      161,
    ];
    let _val2 = StaticArray.fromArray(_val2_);
    let val2 = bytes32ToU256(_val2);

    // + ...
    let _val3_: Array<u8> = [
      128, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 93, 87, 110, 115, 87, 164, 80, 29, 223, 233, 47, 70, 104, 27, 32,
      160,
    ];
    let _val3 = StaticArray.fromArray(_val3_);
    let val3 = bytes32ToU256(_val3);

    assert(val1 > val0);
    assert(val2 > val1);
    assert(val3 > val2);
  });
});
