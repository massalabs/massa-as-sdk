import {Storage, Address} from '../../std/index';
import {
  setNFT,
  name,
  symbol,
  tokenURI,
  baseURI,
  limitSupply,
  mint,
  currentSupply,
  transfer,
  setURI,
  ownerOf,
} from '../NFT';

import {ByteArray} from '@massalabs/as/assembly';
const toAddress = new Address(
  'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
);
const transferAddress = new Address(
  'A123gSiqHfXDtoAdKLPv8ojhXga23WP6QCmjHqRNsWq2pmom7xxQ',
);

describe('NFT contract TEST', (): i32 => {
  test('setNFT call', (): i32 => {
    setNFT('');
    const got = Storage.get('Counter');
    const want = '0';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('name call', (): i32 => {
    const got = name('');
    const want = 'MASSA_NFT';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('symbol call', (): i32 => {
    const got = symbol('');
    const want = 'NFT';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('TokenURI call', (): i32 => {
    const got = tokenURI('1');
    const want = 'massa.net/nft/1';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('BaseURI call', (): i32 => {
    const got = baseURI('');
    const want = 'massa.net/nft/';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('Limitsupply call', (): i32 => {
    const got = limitSupply('');
    const want = '3';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('Current supply call', (): i32 => {
    const got = currentSupply('');
    const want = '0';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });

  test('Mint test', (): i32 => {
    for (let i = 0; i < 4; i++) {
      mint(toAddress.toByteString());
    }
    const got = ownerOf('3');
    const want = toAddress.toByteString();
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('transfer test', (): i32 => {
    const args = transferAddress
      .toStringSegment()
      .concat(ByteArray.fromU64(2).toByteString());
    transfer(args);
    const got = ownerOf('2');
    const want = transferAddress.toByteString();
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  test('Change URI', (): i32 => {
    const newURI = 'my.massa/';
    setURI(newURI);
    const got = baseURI('');
    const want = newURI;
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  return TestResult.Success;
});