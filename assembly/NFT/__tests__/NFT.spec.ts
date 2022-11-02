import {Storage} from '../../std/index';
import {event, setStorage} from '../sum';
import {Address} from '../../std/index';
import {
    setNFT,
    Name,
    Symbol,
    TokenURI,
    BaseURI,
    LimitSupply,
    Mint,
} from '../NFT_fortest';

const ofAddress = new Address('0x');

describe('NFT contract TEST', () => {
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
    test('setNFT call', () => {
        setNFT('');
        const got = Storage.getOf(ofAddress, 'Counter');
        const want = '0';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('TokenURI call', () => {
        const got = TokenURI(1);
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
        const want = 10000;
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
    test('Mint call', () => {
        Mint(ofAddress);
        const got = Storage.getOf(ofAddress, 'owners');
        const want = '10000';
        if (got != want) {
            error(got.toString() + ', ' + want.toString() + ' was expected.');
            return;
        }
    });
});
