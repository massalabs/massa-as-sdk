/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Args, generateEvent, Storage} from '../../std';
import {getDate} from '../../vm-mock/storage';
import {ProposalState} from '../enums';
import * as token from '../impl';
// TODO change relative path to cleaner import
// import {setData} from '../../vm-mock/storage';

const dumbAddress1 = 'A1sySP3cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF4n';
const dumbAddress2 = 'V3zyAE8cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF6n';

// test('should expose token name', () => {
//   generateEvent(getDate().toString());
//   error(getDate().toString());
//   return TestResult.Success;
// });

test('CreateProposal', (): i32 => {
  const args = new Args()
    .add(dumbAddress1)
    .add('SuperProposal')
    .add('im the description of the year')
    .add('MoonToken')
    .add('MOON')
    .add(15 as f32)
    .add(100 as f32)
    .add(5 as u32);
  token.createProposal(args.serialize());

  let want = new Args();
  want.add(dumbAddress1);
  want.add('proposal1');
  want.add('SuperProposal');
  want.add(ProposalState.Created as u32);
  want.add('im the description of the year');
  want.add('MoonToken');
  want.add('MOON');
  want.add(15 as f32);
  want.add(100 as f32);
  want.add(5 as u32);
  want.add((getDate() + 15) as f32);
  want.add(getDate() as f32);

  // `Propopropossal{address: A1sySP3cNzfgP58zsyxt97KCF1i7xwFBvgYcvc32XRhpK5anF4n, name: SuperProposal,
  //   description: im the description of the year, tokenName: MoonToken, tokenSymbol: MOON, tokenSupply: 5,
  //   tokenPrice: 25000, tokenDecimals: 150}`;
  let got = Storage.get('Dataproposal1');
  let wait = new Args(got);
  const addrwait = wait.nextAddress().toByteString();
  const proposalwait = wait.nextString();
  const titlewait = wait.nextString();
  const statewait = wait.nextU32();
  const descriwait = wait.nextString();
  const tokenNamewait = wait.nextString();
  const tokenSymbolwait = wait.nextString();
  const votingDelaywait = wait.nextF32();
  const votingPeriodWait = wait.nextF32();
  const tresholdWait = wait.nextU32();
  const launchDateWait = wait.nextF32();
  const lastUpdateWait = wait.nextF32();

  error(
    addrwait +
      ' ' +
      proposalwait +
      ' ' +
      titlewait +
      ' ' +
      statewait.toString() +
      ' ' +
      descriwait +
      ' ' +
      tokenNamewait +
      ' ' +
      tokenSymbolwait +
      ' ' +
      votingDelaywait.toString() +
      ' ' +
      votingPeriodWait.toString() +
      ' ' +
      tresholdWait.toString() +
      ' ' +
      launchDateWait.toString() +
      ' ' +
      lastUpdateWait.toString(),
  );

  const addr = want.nextAddress().toByteString();
  const proposal = want.nextString();
  const title = want.nextString();
  const state = want.nextU32();
  const descri = want.nextString();
  const tokenName = want.nextString();
  const tokenSymbol = want.nextString();
  const votingDelay = want.nextF32();
  const votingPeriod = want.nextF32();
  const treshold = want.nextU32();
  const launchDate = want.nextF32();
  const lastUpdate = want.nextF32();

  error(
    addr +
      ' ' +
      proposal +
      ' ' +
      title +
      ' ' +
      state.toString() +
      ' ' +
      descri +
      ' ' +
      tokenName +
      ' ' +
      tokenSymbol +
      ' ' +
      votingDelay.toString() +
      ' ' +
      votingPeriod.toString() +
      ' ' +
      treshold.toString() +
      ' ' +
      launchDate.toString() +
      ' ' +
      lastUpdate.toString(),
  );

  if (addr != addrwait) {
    error('a  ITS HERE  wasnt expected.');
  }
  if (proposal != proposalwait) {
    error(`B  ITS HERE  ${proposal} != ${proposalwait} this  wasnt expected.`);
  }
  if (descri != descriwait) {
    error('C  ITS HERE  wasnt expected.');
  }
  if (state != statewait)
    error(
      `There is an error on : ${state} != ${statewait} this  wasnt expected.`,
    );
  if (tokenName != tokenNamewait)
    error(
      `There is an error on : ${tokenName} != ${tokenNamewait} this  wasnt expected.`,
    );
  if (tokenSymbol != tokenSymbolwait)
    error(
      `There is an error on : ${tokenSymbol} != ${tokenSymbolwait} this  wasnt expected.`,
    );
  if (votingDelay != votingDelaywait)
    error(
      `There is an error on : ${votingDelay} != ${votingDelaywait} this  wasnt expected.`,
    );
  if (votingPeriod != votingPeriodWait)
    error(
      `There is an error on : ${votingPeriod} != ${votingPeriodWait} this  wasnt expected.`,
    );
  if (treshold != tresholdWait)
    error(
      `There is an error on : ${proposal} != ${proposalwait} this  wasnt expected.`,
    );
  if (launchDate != launchDateWait)
    error(
      `There is an error on : ${launchDate} != ${launchDateWait} this  wasnt expected.`,
    );
  if (lastUpdate != lastUpdateWait)
    error(
      `There is an error on : ${lastUpdate} != ${lastUpdateWait} this  wasnt expected.`,
    );

  if (
    addr != addrwait ||
    proposal != proposalwait ||
    title != titlewait ||
    descri != descriwait ||
    state != statewait ||
    tokenName != tokenNamewait ||
    tokenSymbol != tokenSymbolwait ||
    votingDelay != votingDelaywait ||
    votingPeriod != votingPeriodWait ||
    treshold != tresholdWait ||
    launchDate != launchDateWait ||
    lastUpdate != lastUpdateWait
  ) {
    error('error one property in wait wasnt expected.');
    return TestResult.Failure;
  }
  return TestResult.Success;
});

describe('editProposal tests', (): i32 => {
  test('should return proposalState', () => {
    const args = new Args()
      .add(dumbAddress1)
      .add('SuperProposal')
      .add('im the description of the year')
      .add('MoonToken')
      .add('MOON')
      .add(15 as f32)
      .add(100 as f32)
      .add(5 as u32);
    token.createProposal(args.serialize());

    const argsEdit = new Args()
      .add(dumbAddress1)
      // here its proposalId
      .add('proposal1')
      // here its title
      .add('SuperProposalDDDD')
      .add(ProposalState.Created as u32)
      .add('im the descriptionAA of the year')
      .add('MoonToken')
      .add('MOOIN')
      .add(255 as f32)
      .add(255 as f32)
      .add(250 as u32)
      .add(2555 as f32)
      .add(2500 as f32);
    token.editProposal(argsEdit.serialize());

    // WANT

    let want = new Args();
    want.add(dumbAddress1);
    want.add('DataProposal1');
    want.add('SuperProposalDDDD');
    want.add(ProposalState.Created as u32);
    want.add('im the descriptionAA of the year');
    want.add('MoonToken');
    want.add('MOOIN');
    want.add(255 as f32);
    want.add(255 as f32);
    want.add(250 as u32);
    want.add((2500 + 2555) as f32);
    want.add(2555 as f32);

    const addr = want.nextAddress();
    const proposal = want.nextString();
    const title = want.nextString();
    const state = want.nextU32();
    const descri = want.nextString();
    const tokenName = want.nextString();
    const tokenSymbol = want.nextString();
    const votingDelay = want.nextF32();
    const votingPeriod = want.nextF32();
    const treshold = want.nextU32();
    const launchDate = want.nextF32();
    const lastUpdate = want.nextF32();

    let got = Storage.get('Dataproposal1');
    let wait = new Args(got);
    const addrwait = wait.nextAddress();
    const proposalwait = wait.nextString();
    const titlewait = wait.nextString();
    const statewait = wait.nextU32();
    const descriwait = wait.nextString();
    const tokenNamewait = wait.nextString();
    const tokenSymbolwait = wait.nextString();
    const votingDelaywait = wait.nextF32();
    const votingPeriodWait = wait.nextF32();
    const tresholdWait = wait.nextU32();
    const launchDateWait = wait.nextF32();
    const lastUpdateWait = wait.nextF32();

    if (addr.toByteArray() != addrwait.toByteArray())
      error(
        `There is an error on : ${addr.toByteString()} != ${addrwait.toByteString()} this  wasnt expected.`,
      );
    if (proposal != proposalwait)
      error(
        `There is an error on : ${proposal} != ${proposalwait} this  wasnt expected.`,
      );
    if (title != titlewait)
      error(
        `There is an error on : ${title} != ${titlewait} this  wasnt expected.`,
      );
    if (state != statewait)
      error(
        `There is an error on : ${state} != ${statewait} this  wasnt expected.`,
      );
    if (tokenName != tokenNamewait)
      error(
        `There is an error on : ${tokenName} != ${tokenNamewait} this  wasnt expected.`,
      );
    if (tokenSymbol != tokenSymbolwait)
      error(
        `There is an error on : ${tokenSymbol} != ${tokenSymbolwait} this  wasnt expected.`,
      );
    if (votingDelay != votingDelaywait)
      error(
        `There is an error on : ${votingDelay} != ${votingDelaywait} this  wasnt expected.`,
      );
    if (votingPeriod != votingPeriodWait)
      error(
        `There is an error on : ${votingPeriod} != ${votingPeriodWait} this  wasnt expected.`,
      );
    if (treshold != tresholdWait)
      error(
        `There is an error on : ${proposal} != ${proposalwait} this  wasnt expected.`,
      );
    if (launchDate != launchDateWait)
      error(
        `There is an error on : ${launchDate} != ${launchDateWait} this  wasnt expected.`,
      );
    if (lastUpdate != lastUpdateWait)
      error(
        `There is an error on : ${lastUpdate} != ${lastUpdateWait} this  wasnt expected.`,
      );

    if (
      addr != addrwait ||
      proposal != proposalwait ||
      title != titlewait ||
      descri != descriwait ||
      state != statewait ||
      tokenName != tokenNamewait ||
      tokenSymbol != tokenSymbolwait ||
      votingDelay != votingDelaywait ||
      votingPeriod != votingPeriodWait ||
      lastUpdate != lastUpdateWait
    ) {
      error(
        'got:' +
          got.toString() +
          ', ' +
          'want :' +
          want.serialize() +
          ' wasnt expected.',
      );
      return TestResult.Failure;
    }
    return TestResult.Success;
  });
  return TestResult.Success;
});
