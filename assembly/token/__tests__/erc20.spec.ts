import * as token from '../impl';
// TODO change relative path to cleaner import

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
});
