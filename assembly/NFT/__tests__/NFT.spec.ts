import {Storage} from '../../std/index';
import {Address} from '../../std/index';
import {
    setNFT,
    Name,
    Symbol,
    TokenURI,
    BaseURI,
    LimitSupply,
    Mint,
    CurrentSupply,
    increment,
    Tranfer,
} from '../NFT_fortest';

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
        const got = Name('');
        const want = 'MASSA_NFT';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('symbol call', () => {
        const got = Symbol('');
        const want = 'NFT';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('TokenURI call', () => {
        const got = TokenURI('1');
        const want = 'massa.net/nft/1';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('BaseURI call', () => {
        const got = BaseURI('');
        const want = 'massa.net/nft/';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('Limitsupply call', () => {
        const got = LimitSupply('');
        const want = '3';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('Current supply call', () => {
        const got = CurrentSupply('');
        const want = '0';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });

    test('Mint test', () => {
        for (let i = 1; i <= 5; i++) {
            Mint(toAddress);
        }
        const got = Storage.getOf(ofAddress, 'ownerOf_3');
        const want = '1x';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('transfer test', () => {
        Tranfer(transferAddress, 2);
        const got = Storage.getOf(ofAddress, 'ownerOf_2');
        const want = transferAddress._value;
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
});
