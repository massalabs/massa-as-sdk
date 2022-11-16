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

describe('NFT contract TEST', () => {
    test('setNFT call', () => {
        setNFT('');
        const got = Storage.get('Counter');
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
        const got = tokenURI('1');
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
        for (let i = 0; i < 4; i++) {
            mint(toAddress.toByteString());
        }
        const got = ownerOf('3');
        const want = toAddress.toByteString();
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('transfer test', () => {
        const args = transferAddress
            .toStringSegment()
            .concat(ByteArray.fromU64(2).toByteString());
        transfer(args);
        const got = ownerOf('2');
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
        const want = newURI;
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
});
