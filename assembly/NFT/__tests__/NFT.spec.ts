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
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('name call', () => {
    const got = name('');
    const want = 'MASSA_NFT';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('symbol call', () => {
    const got = symbol('');
    const want = 'NFT';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('TokenURI call', () => {
    const tokenId = '1';
    const got = tokenURI(tokenId);
    const want = 'massa.net/nft/1';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('BaseURI call', () => {
    const got = baseURI('');
    const want = 'massa.net/nft/';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('Limitsupply call', () => {
    const got = limitSupply('');
    const want = '3';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('Current supply call', () => {
    const got = currentSupply('');
    const want = '0';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });

  test('Mint test', () => {
    for (let i = 1; i <= 5; i++) {
      mint(toAddress.toByteString());
    }
    const keyOwner = 'ownerOf_3';
    const got = Storage.getOf(ofAddress, keyOwner);
    const want = '1x';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('transfer test', () => {
    const keyOwner = 'ownerOf_2';
    const args = transferAddress
      .toStringSegment()
      .concat(ByteArray.fromU64(2).toByteString());
    transfer(args);
    const got = Storage.getOf(ofAddress, keyOwner);
    const want = transferAddress.toByteString();
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
  test('Change URI', () => {
    const newURI = 'my.massa/';
    setURI(newURI);
    const got = baseURI('');
    const want = 'my.massa/';
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' was expected.');
      return;
    }
  });
});
