import {Storage, Address, Args} from '../../std/index';
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

const toAddress = new Address(
  'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
);
const transferAddress = new Address(
  'A123gSiqHfXDtoAdKLPv8ojhXga23WP6QCmjHqRNsWq2pmom7xxQ',
);

describe('NFT contract TEST', () => {
  test('setNFT call', () => {
    setNFT('');
    expect(Storage.get('Counter')).toBe('0');
  });

  test('name call', () => {
    expect(name('')).toBe('MASSA_NFT');
  });

  test('symbol call', () => {
    expect(symbol('')).toBe('NFT');
  });

  xtest('TokenURI call', () => {
    const args = new Args().add(u64(1));
    const tokenUri = tokenURI(args.serialize());
    expect(tokenUri).toBe('massa.net/nft/1');

    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
  xtest('BaseURI call', () => {
    const got = baseURI('');
    const want = 'massa.net/nft/';
    expect(got).toBe(want);

    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
  xtest('Limitsupply call', () => {
    const got = limitSupply('');
    const want = '10000';
    expect(got).toBe(want);

    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
  xtest('Current supply call', () => {
    const got = currentSupply('');
    const want = '0';
    expect(got).toBe(want);

    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });

  xtest('Mint test', () => {
    for (let i = 0; i < 4; i++) {
      const args = new Args().add(toAddress);

      mint(args.serialize());
    }
    const ownerOfArgs = new Args().add(u64(3));
    const got = ownerOf(ownerOfArgs.serialize());
    const want = toAddress.toByteString();
    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
  xtest('transfer test', () => {
    const args = new Args().add(transferAddress).add(u64(3));
    transfer(args.serialize());
    const ownerOfArgs = new Args().add(u64(3));
    const got = ownerOf(ownerOfArgs.serialize());
    const want = transferAddress.toByteString();
    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
  xtest('Change URI', () => {
    const newURI = 'my.massa/';
    const args = new Args().add(newURI);
    setURI(args.serialize());
    const got = baseURI('');
    const want = newURI;
    // if (got != want) {
    //   error(got.toString() + ', ' + want.toString() + ' was expected.');
    //   return TestResult.Failure;
    // }
    // return TestResult.Success;
  });
});
