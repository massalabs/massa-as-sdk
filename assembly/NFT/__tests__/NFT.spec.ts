import {Storage} from '../../std/index';
import {Address} from '../../std/index';
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
} from '../NFT_fortest';
import {ByteArray} from '@massalabs/as/assembly';
const ofAddress = new Address('0x');
const toAddress = new Address('1x');
const transferAddress = new Address('2x');

describe('NFT contract TEST', () => {
  test('setNFT call', () => {
    setNFT('');
    const got = Storage.getOf(ofAddress, 'Counter');
    const want = '0';
    expect(got).toBe(want);
  });
  test('name call', () => {
    const got = name('');
    const want = 'MASSA_NFT';
    expect(got).toBe(want);
  });
  test('symbol call', () => {
    const got = symbol('');
    const want = 'NFT';
    expect(got).toBe(want);
  });
  test('TokenURI call', () => {
    const got = tokenURI('1');
    const want = 'massa.net/nft/1';
    expect(got).toBe(want);
  });
  test('BaseURI call', () => {
    const got = baseURI('');
    const want = 'massa.net/nft/';
    expect(got).toBe(want);
  });
  test('Limitsupply call', () => {
    const got = limitSupply('');
    const want = '3';
    expect(got).toBe(want);
  });
  test('Current supply call', () => {
    const got = currentSupply('');
    const want = '0';
    expect(got).toBe(want);
  });

  test('Mint test', () => {
    for (let i = 1; i <= 5; i++) {
      mint(toAddress.toByteString());
    }
    const got = Storage.getOf(ofAddress, 'ownerOf_3');
    const want = '1x';
    expect(got).toBe(want);
  });
  test('transfer test', () => {
    const args = transferAddress
      .toStringSegment()
      .concat(ByteArray.fromU64(2).toByteString());
    transfer(args);
    const got = Storage.getOf(ofAddress, 'ownerOf_2');
    const want = transferAddress.toByteString();
    expect(got).toBe(want);
  });
  test('Change URI', () => {
    setURI('my.massa/');
    const got = baseURI('');
    const want = 'my.massa/';
    expect(got).toBe(want);
  });
});
