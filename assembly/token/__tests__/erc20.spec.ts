import {Args, Storage} from '../../std';
import * as token from '../impl';
// TODO change relative path to cleaner import
// import {setData} from '../../vm-mock/storage';

const dumbAddress1 = 'A1sySP3cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF4n';
const dumbAddress2 = 'V3zyAE8cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF6n';

describe('Black box tests', () => {
  it('should expose token name', () => {
    expect<string>(token.name('')).toBe('Standard token implementation');
  });

  //   it('should return 0 for initialized balance', () => {
  //     expect<string>(token.balanceOf('XXXaddress-1XXX')).toBe(
  //       '0',
  //       'default balance not working',
  //     );
  //   });

  //   it('should return initialized balance', () => {
  //     setData('balXXXaddress-1XXX', '1000');
  //     expect<string>(token.balanceOf('XXXaddress-1XXX')).toBe(
  //       '1000',
  //       'initialized balance not working',
  //     );
  //   });
});

describe('CreateProposal tests', () => {
  test('should create a proposal', () => {
    const args = new Args()
      .add(dumbAddress1)
      .add('SuperProposal')
      .add('im the description of the year')
      .add('MoonToken')
      .add('MOON')
      .add(5)
      .add(25000)
      .add(150);
    token.createProposal(args.serialize());
    let want =
      'Proposal{address: A1sySP3cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF4n, name: SuperdsdsProposal, description: im the description of the year, tokenName: MoonToken, tokenSymbol: MOON, tokenSupply: 5, tokenPrice: 25000, tokenDecimals: 150}';
    let got = Storage.get('ProposalDataProposalId1');
    if (got != want) {
      error(got.toString() + ', ' + want.toString() + ' wasnt expected.');
      return;
    }
  });
});
