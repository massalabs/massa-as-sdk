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
    CheckLedger,
    increment,
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
    // test("Current supply after increment", () => {
    //     increment("");
    //     const got = CurrentSupply("");
    //     const want = "1";
    //     if (got != want) {
    //         error(got.toString() + ", " + want.toString() + " was expected.");
    //         return;
    //     }
    // });
    test('CheckLedger call', () => {
        const got = CheckLedger('');
        const want = ',1,,2,,3';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('Mint test', () => {
        for (let i = 1; i <= 3; i++) {
            Mint(toAddress);
        }
        const got = CheckLedger('');
        const want = '1x,1,1x,2,1x,3';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('transfer test', () => {
        for (let i = 1; i <= 2; i++) {
            Mint(toAddress);
        }
        const got = CheckLedger('');
        const want = '1x,1,1x,2,1x,3';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
});
