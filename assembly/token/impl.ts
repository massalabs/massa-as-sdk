/* eslint-disable @typescript-eslint/no-unused-vars */
import {Address, Storage, Context, generateEvent, getDate} from '../std/index';

import {ByteArray} from '@massalabs/as/assembly';
import {Args} from '../std/arguments';
import {ProposalState, Reason} from './enums';
import {caller} from '../std/context';
const TRANSFER_EVENT_NAME = 'TRANSFER';
const APPROVAL_EVENT_NAME = 'APPROVAL';
/**
 * Constructs an event given a key and arguments
 *
 * @param {string} key - event key
 * @param {Array} args - array of string arguments.
 * @return {string} stringified event.
 */
export function createEvent(key: string, args: Array<string>): string {
  return `${key}:`.concat(args.join(','));
}

/**
 * Returns the version of this smart contract.
 * This versioning is following the best practices defined in https://semver.org/.
 *
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function version(_: string): string {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  return '0.0.0';
}

// ======================================================== //
// ====                 TOKEN ATTRIBUTES                ==== //
// ======================================================== //

/**
 * Returns the name of the token.
 *
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string} token name.
 */
export function name(_: string): string {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  return 'Standard token implementation';
}

/** Returns the symbol of the token.
 *
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string} token symbol.
 */
export function symbol(_: string): string {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  return 'STI';
}

/**
 * Returns the total token supply.
 *
 * The number of tokens that were initially minted.
 *
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string} - u64
 */
export function totalSupply(_: string): string {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  return '10000';
}

/**
 * Returns the maximum number of digits being part of the fractional part
 * of the token when using a decimal representation.
 *
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function decimals(_: string): string {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  return '2';
}

// ==================================================== //
// ====                 BALANCE                    ==== //
// ==================================================== //

/**
 * Returns the balance of an account.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing an owner's account (Address).
 *
 * @return {string} - u64
 */
export function balanceOf(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const addr = args.nextAddress();

  const r = addr.isValid() ? _balance(addr) : <u64>NaN;
  return r.toString();
}

/**
 * Returns the balance of a given address.
 *
 * @param {Address} address - address to get the balance for
 *
 * @return {u64}
 */
function _balance(address: Address): u64 {
  const bal = Storage.has(address.toByteString())
    ? Storage.get(address.toByteString())
    : '0';

  return U64.parseInt(bal, 10);
}

/**
 * Sets the balance of a given address.
 *
 * @param {Address} address - address to set the balance for
 * @param {u64} balance
 *
 */
function _setBalance(address: Address, balance: u64): void {
  Storage.set(address.toByteString(), balance.toString());
}

// ==================================================== //
// ====                 TRANSFER                   ==== //
// ==================================================== //

/**
 * Transfers tokens from the caller's account to the recipient's account.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the recipient's account (address)
 * - the number of tokens (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function transfer(stringifyArgs: string): string {
  const ownerAddress = Context.caller();

  const args = new Args(stringifyArgs);
  const toAddress = args.nextAddress();
  const amount = args.nextU64();

  if (!toAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  if (!_transfer(ownerAddress, toAddress, amount)) {
    return '0';
  }

  const event = createEvent(TRANSFER_EVENT_NAME, [
    ownerAddress.toByteString(),
    toAddress.toByteString(),
    amount.toString(),
  ]);
  generateEvent(event);

  return '1';
}

/**
 * Transfers tokens from the caller's account to the recipient's account.
 *
 * @param {Address} from - sender address
 * @param {Address} to - recipient address
 * @param {u64} amount - number of token to transfer
 *
 * @return {bool}
 */
function _transfer(from: Address, to: Address, amount: u64): bool {
  const currentFromBalance = _balance(from);
  const currentToBalance = _balance(to);
  const newTobalance = currentToBalance + amount;

  if (
    currentFromBalance < amount || // underflow of balance from
    newTobalance < currentToBalance
  ) {
    // overflow of balance to
    return false;
  }

  _setBalance(from, currentFromBalance - amount);
  _setBalance(to, newTobalance);

  return true;
}

// ==================================================== //
// ====                 ALLOWANCE                  ==== //
// ==================================================== //

/**
 * Returns the allowance set on the owner's account for the spender.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the owner's account (address)
 * - the spender's account (address).
 *
 * @return {string} - u64
 */
export function allowance(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const spenderAddress = args.nextAddress();

  const r =
    ownerAddress.isValid() && spenderAddress.isValid()
      ? _allowance(ownerAddress, spenderAddress)
      : <u64>NaN;

  return r.toString();
}

/**
 * Returns the allowance set on the owner's account for the spender.
 *
 * @param {Address} ownerAddress - owner's id
 * @param {Address} spenderAddress - spender's id
 *
 * @return {u64} the allowance
 */
function _allowance(ownerAddress: Address, spenderAddress: Address): u64 {
  const k = ownerAddress.toByteString().concat(spenderAddress.toByteString());
  const allow = Storage.has(k) ? Storage.get(k) : '0';

  return U64.parseInt(allow, 10);
}

/**
 * Increases the allowance of the spender on the owner's account by the amount.
 *
 * This function can only be called by the owner.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the spender's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function increaseAllowance(stringifyArgs: string): string {
  const ownerAddress = Context.caller();

  const args = new Args(stringifyArgs);
  const spenderAddress = args.nextAddress();
  const amount = args.nextU64();

  if (!spenderAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  const newAllowance = _allowance(ownerAddress, spenderAddress) + amount;

  if (newAllowance < amount) {
    return '0'; // would result in an overflow
  }

  _approve(ownerAddress, spenderAddress, newAllowance);

  const event = createEvent(APPROVAL_EVENT_NAME, [
    ownerAddress.toByteString(),
    spenderAddress.toByteString(),
    newAllowance.toString(),
  ]);
  generateEvent(event);

  return '1';
}

/**
 * Decreases the allowance of the spender the on owner's account by the amount.
 *
 * This function can only be called by the owner.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the spender's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function decreaseAllowance(stringifyArgs: string): string {
  const ownerAddress = Context.caller();

  const args = new Args(stringifyArgs);
  const spenderAddress = args.nextAddress();
  const amount = args.nextU64();

  if (!spenderAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  const current = _allowance(ownerAddress, spenderAddress);

  if (current < amount) {
    return '0'; // underflow
  }

  const newAllowance = current - amount;

  _approve(ownerAddress, spenderAddress, newAllowance);

  const event = createEvent(APPROVAL_EVENT_NAME, [
    ownerAddress.toByteString(),
    spenderAddress.toByteString(),
    newAllowance.toString(),
  ]);
  generateEvent(event);

  return '1';
}

/**
 * Sets the allowance of the spender on the owner's account.
 *
 * @param {Address} ownerAddress - owner address
 * @param {Address} spenderAddress - spender address
 * @param {u64} amount - amount to set an allowance for
 *
 */
function _approve(
  ownerAddress: Address,
  spenderAddress: Address,
  amount: u64,
): void {
  Storage.set(
    ownerAddress.toByteString().concat(spenderAddress.toByteString()),
    amount.toString(),
  );
}

/**
 * Transfers token ownership from the owner's account to the recipient's account
 * using the spender's allowance.
 *
 * This function can only be called by the spender.
 * This function is atomic:
 * - both allowance and transfer are executed if possible;
 * - or if allowance or transfer is not possible, both are discarded.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function transferFrom(stringifyArgs: string): string {
  const spenderAddress = Context.caller();

  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const recipientAddress = args.nextAddress();
  const amount = args.nextU64();

  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  const spenderAllowance = _allowance(ownerAddress, spenderAddress);

  if (spenderAllowance < amount) {
    return '0';
  }

  if (!_transfer(ownerAddress, recipientAddress, amount)) {
    return '0';
  }

  _approve(ownerAddress, spenderAddress, spenderAllowance - amount);

  const event = createEvent(TRANSFER_EVENT_NAME, [
    ownerAddress.toByteString(),
    recipientAddress.toByteString(),
    amount.toString(),
  ]);
  generateEvent(event);

  return '1';
}
// ==================================================== //
// ====                 VOTE                       ==== //
// ==================================================== //
/**
 * This function is to delegate voting power from one Address to Another Addres
 * @param {string} stringifyArgs - byte string with the following format:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 * */
export function delegate(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const recipientAddress = args.nextAddress();
  const amount = args.nextU32();

  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  const ownerBalance = _balance(ownerAddress);
  if (ownerBalance < amount) {
    return '0';
  }
  // fetch staked balance of owner
  const ownerStakedBalance = new Args(Storage.get('StakedPower')).nextI32();
  if (ownerStakedBalance - ownerBalance < amount) {
    return '0';
  }

  addVotingPower(args.serialize());
  return '1';
}

/**
 * This function is to update voting power from one Address to Another Addres
 * @param {string} stringifyArgs - byte string with the following format:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u32).
 *
 * @return {string} - boolean value ("1" or "0")
 * */
export function addVotingPower(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const recipientAddress = args.nextAddress();
  const amount = args.nextU32();

  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }
  const recipientBalance = _balance(recipientAddress);

  const delegatedPowerRecipient = u32(
    Storage.getOf(recipientAddress, 'DelegatedPower'),
  );

  const stakedPowerRecipient = u32(
    Storage.getOf(recipientAddress, 'StakedPower'),
  );

  const stakedPowerOwner = u32(Storage.getOf(ownerAddress, 'StakedPower'));

  Storage.setOf(
    recipientAddress,
    'DelegatedPower',
    (
      amount +
      delegatedPowerRecipient +
      recipientBalance -
      stakedPowerRecipient
    ).toString(),
  );
  Storage.setOf(
    ownerAddress,
    'StakedPower',
    (stakedPowerOwner + amount).toString(),
  );
  return '1';
}

/**
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the proposalId, to find id in datastore (string);
 * - the amount, of voting power (u32).
 * - the reason, For Against Abstain (u32).
 * @return {string} - boolean value ("1" or "0")*/
export function castVote(stringifyArgs: string): string {
  const voter = Context.caller();
  const scAddr = Context.callee();
  const args = new Args(stringifyArgs);
  const proposalId = args.nextString();
  const amount = args.nextU32();
  const reason = args.nextU32();

  if (
    reason != u32(Reason.FOR) &&
    reason != u32(Reason.AGAINST) &&
    reason != u32(Reason.ABSTAIN)
  ) {
    return 'Voting : Invalid reason';
  }

  if (getProposal(proposalId) == '0') {
    return 'Voting : Proposal not found';
  }

  // Check if the proposal State is Active
  const argsproposal = new Proposal(getProposal(proposalId));

  // // Fetch Voting Power of the voter
  // const votingPowerUser = new VotingPower(Storage.get('VotingPower '+voter));

  // Fetch VotingDataUser from Storage
  const votingDataUser = new VotingData(
    Storage.get('VotingData'.concat(proposalId).concat(voter.toByteString())),
  );

  // // Fetch votingDataProposal from Storage
  // const votingDataProposal = new VotingData(
  //   Storage.get('VotingData '+proposalId)
  // );

  if (
    argsproposal.id != proposalId ||
    argsproposal.proposalState != u32(ProposalState.Active)
  ) {
    return 'Voting : Invalid proposal';
  }
  const votingPowerAvailable = getVotingPowerForAProposal(argsproposal.id);

  // getDelegatedPower

  // // Push DataStore Proposal to local variables
  // const argsVotingDataProposal = new Args(votingDataProposal);
  // let forUserCount = argsVotingDataProposal.nextU32();
  // let againstUserCount = argsVotingDataProposal.nextU32();
  // let abstainUserCount = argsVotingDataProposal.nextU32();

  // // Push DataStoreUser to local variables
  // const argsVotingDataUser = new Args(votingDataUser);
  // let forProposalCount = argsVotingDataUser.nextU32();
  // let againstProposalCount = argsVotingDataUser.nextU32();
  // let abstainProposalCount = argsVotingDataUser.nextU32();

  // const argsVotingDataUserToStore = new Args();
  // const argsVotingDataProposalToStore = new Args();

  let valueToStore: number;
  amount > votingPowerAvailable
    ? (valueToStore = votingPowerAvailable)
    : (valueToStore = amount);
  // Store Data User depend on reason
  // Store Data proposal depend on reason
  switch (reason) {
    case Reason.FOR:
      // Store Voting User Data to DataStore
      votingDataUser.voteFor += valueToStore;

      // Store Data Proposal to DataStore
      argsproposal.proposalVotingData.voteFor += valueToStore;

      break;
    case Reason.AGAINST:
      // Store Voting User Data to DataStore
      votingDataUser.voteAgainst += valueToStore;

      // Store Data Proposal to DataStore
      argsproposal.proposalVotingData.voteAgainst += valueToStore;

      break;
    case Reason.ABSTAIN:
      // Store Voting User Data to DataStore
      votingDataUser.voteAbstain += valueToStore;

      // Store Data Proposal to DataStore
      argsproposal.proposalVotingData.voteAbstain += valueToStore;
    default:
      break;
  }
  // Update Votin Data proposal
  updateProposalFromStorage(argsproposal.serialize());

  // Update Voting Data User
  Storage.set(
    'VotingData'.concat(proposalId).concat(voter.toByteString()),
    votingDataUser.serialize(),
  );

  return 'Voting : Vote added';
}

/**
 * Decreases the allowance of the spender the on owner's account by the amount.
 *
 * This function can only be called by the owner.
 *
 * @param {string} proposalId - ProposalId:
 * - proposalId - id of Proposal (string).
 *
 *
 * @return {u32} - boolean value ("1" or "0")
 */
function getVotingPowerForAProposal(proposalId: string): u32 {
  const voter = Context.caller();
  const bal = _balance(voter);

  let votingPowerUser = 0;

  // Fetch Voting Power of the voter
  const votingPowerForProposal = Storage.get('VotingPower'.concat(proposalId));
  votingPowerForProposal.split(',').forEach((votingPower) => {
    const argsVotingPower = new Args(votingPower);
    const voterAddress = argsVotingPower.nextAddress();
    const votingDelegatedPower = argsVotingPower.nextU32();
    const votingStakedPower = argsVotingPower.nextU32();
    if (voterAddress == voter) {
      // Calculate Voting Power
      return (votingPowerUser = votingDelegatedPower + bal - votingStakedPower);
    }
    return votingPowerUser;
  });
  // Fetch Actual VotingData from Storage
  let votingPowerNonAvailable = 0;
  const votingDataUserForProposal = Storage.get('VotingData'.concat(proposalId))
    .split(',')
    .forEach((votingData) => {
      const userVotingData = new VotingData(votingData);
      if (userVotingData.owner == voter) {
        return (votingPowerNonAvailable =
          userVotingData.voteFor +
          userVotingData.voteAgainst +
          userVotingData.voteAbstain);
      }
    });
  return votingPowerUser - votingPowerNonAvailable;
}

//   // Fetch DelegatedPower from Storage
//   const delegatedPower = new Args(
//     Storage.get('DelegatedPower'.concat(voter.toByteString())),
//   ).nextU32();

//   // fetch StakedPower from user Storage
//   const stakedPower = new Args(
//     Storage.get('StakedPower'.concat(voter.toByteString())),
//   ).nextU32();

//   // Fetch VotingData from user from Storage
//   const votingData = Storage.get(
//     'VotingData'.concat(id).concat(voter.toByteString()),
//   );
//   // Put Data in local variable
//   const votingDataArgs = new Args(votingData);
//   // forCount contains the value of vote used for this proposal
//   const forCount = votingDataArgs.nextU32();
//   const againstCount = votingDataArgs.nextU32();
//   const abstainCount = votingDataArgs.nextU32();

//   // Sum of all voting power from this address involved in this proposal to define the voting power available
//   if (bal > 0) {
//     return (
//       forCount +
//       againstCount +
//       abstainCount +
//       stakedPower -
//       (u32(bal) + delegatedPower)
//     );
//   }
//   return 0;
// }
/**
 * GetProposalData from Specific Address and ProposalId
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u32).
 * - proposalId (address);
 *
 * @return {string} - Return string with ProposalData
 */
export function getProposalData(stringifyArgs: string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  let result: string;
  result = Storage.getOf(owner, 'Data'.concat(id));
  return result;
}
/**
 * GetUserVotingData from Specific Address and ProposalId
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u32).
 * - proposalId (address);
 *
 * @return {string} - Return string with ProposalData
 */
export function getUserVotingData(stringifyArgs: string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  let result: string;
  result = Storage.getOf(
    owner,
    'VotingData'.concat(id.concat(owner.toByteString())),
  );
  return result;
}
/**
 * GetUserVotingData from Specific Address and ProposalId
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u32).
 * - proposalId (address);
 * - withArgs (number)
 *
 * @return {string} - Return string with ProposalData
 */
export function getProposalVotingData(stringifyArgs: string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  let result = Storage.get('VotingData'.concat(id));
  return result;
}

// ==================================================== //
// ====                 GOVERNANCE                 ==== //
// ==================================================== //

/**
 * Create a new Proposal
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - proposalId - id of Proposal (string);
 * - proposalType - type of Proposal (string);
 * - proposalTitle - title of Proposal (string);
 * - proposalOwner - owner of Proposal (address);
 * - proposalDescription - description of Proposal (string);
 * - proposalLink - link of Proposal (string);
 * - proposalStart - start of Proposal (string);
 * - proposalVotingDelay - end of Proposal (string);
 * - proposalEnd - end of Proposal (string);
 * - proposalLastUpdate - lastUpdate of Proposal (string);
 * - proposalState - state of Proposal (string);
 * - proposalMinVotingThreshold - minVotingThreshold of Proposal (string);
 **/
export class Proposal {
  id: string;
  title: string;
  owner: Address;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  start: f32;
  lastUpdate: f32;
  proposalState: u32;
  proposalTreshold: u32;
  proposalVotingData: VotingData;
  votingStartDate: f32;
  votingDelay: f32;
  votingPeriod: f32;

  /**
   * constructor
   *
   * @param stringifyArgs
   * id - id of Proposal (string);
   * title - title of Proposal (string);
   * owner - owner of Proposal (address);
   * description - description of Proposal (string);
   * tokenName - tokenName of Proposal (string);
   * tokenSymbol - tokenSymbol of Proposal (string);
   * start - start of Proposal (string);
   * lastUpdate - lastUpdate of Proposal (string);
   * proposalState - state of Proposal (string);
   * proposalTreshold - minVotingThreshold of Proposal (string);
   * proposalData - data of Proposal (string);
   * proposalVotingData - votingData of Proposal (string);
   * votingStartDate - votingStartDate of Proposal (string);
   * votingDelay - votingDelay of Proposal (string);
   * votingPeriod - votingPeriod of Proposal (string);
   */
  constructor(stringifyArgs: string) {
    const args = new Args(stringifyArgs);
    this.id = args.nextString();
    this.title = args.nextString();
    this.owner = args.nextAddress();
    this.description = args.nextString();
    this.tokenName = args.nextString();
    this.tokenSymbol = args.nextString();
    this.start = args.nextF32();
    this.lastUpdate = args.nextF32();
    this.proposalState = args.nextU32();
    this.proposalTreshold = args.nextU32();
    this.proposalVotingData = VotingData.deserialize(args.nextString());
    this.votingStartDate = args.nextF32();
    this.votingDelay = args.nextF32();
    this.votingPeriod = args.nextF32();
  }

  /**
   * serialize - Serialize the Proposal object into a string.
   *
   * @returns {string} - Proposal serialized as a string
   */
  serialize(): string {
    const args = new Args();
    args.add(this.id);
    args.add(this.title);
    args.add(this.owner);
    args.add(this.description);
    args.add(this.tokenName);
    args.add(this.tokenSymbol);
    args.add(this.start);
    args.add(this.lastUpdate);
    args.add(this.proposalState);
    args.add(this.proposalTreshold);
    args.add(this.proposalVotingData.serialize());
    args.add(this.votingDelay);
    args.add(this.votingPeriod);
    return args.serialize();
  }

  /**
   * deserialize - Deserialize the Proposal object from a string.
   *
   * @param {string} stringifyArgs - Args object serialized as a string containing:
   * - proposalId - id of Proposal (string);
   * - proposalType - type of Proposal (string);
   * - proposalTitle - title of Proposal (string);
   *
   */
  static deserialize(stringifyArgs: string): Proposal {
    return new Proposal(stringifyArgs);
  }
}

/**
 * Voting Data for Proposal and Users
 *
 *
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - owner - address of owner (address);
 * - proposalId - id of Proposal (string);
 * - voteFor - total of voteFor (u32);
 * - voteAgainst - total of voteAgainst (u32);
 * - voteAbstain - total of voteAbstain (u32);
 **/
export class VotingData {
  owner: Address;
  proposalId: string;
  voteFor: u32;
  voteAgainst: u32;
  voteAbstain: u32;

  /**
   *
   * @param stringifyArgs
   * owner - address of owner (address);
   * proposalId - id of Proposal (string);
   * voteFor - total of voteFor (u32);
   * voteAgainst - total of voteAgainst (u32);
   * voteAbstain - total of voteAbstain (u32);
   *
   */
  constructor(stringifyArgs: string) {
    const args = new Args(stringifyArgs);
    this.owner = args.nextAddress();
    this.proposalId = args.nextString();
    this.voteFor = args.nextU32();
    this.voteAgainst = args.nextU32();
    this.voteAbstain = args.nextU32();
  }

  /**
   * serialize - Serialize the VotingData object into a string.
   *
   * @returns {string} - VotingData serialized as a string
   */
  serialize(): string {
    const args = new Args();
    args.add(this.owner);
    args.add(this.proposalId);
    args.add(this.voteFor);
    args.add(this.voteAgainst);
    args.add(this.voteAbstain);
    return args.serialize();
  }

  /**
   * deserialize - Deserialize the VotingData object from a string.
   *
   * @param {string} stringifyArgs - Args object serialized as a string containing:
   * - owner - address of owner (address);
   * - proposalId - id of Proposal (string);
   * - voteFor - total of voteFor (u32);
   * - voteAgainst - total of voteAgainst (u32);
   * - voteAbstain - total of voteAbstain (u32);
   *
   * @returns {VotingData} - VotingData object
   *
   */
  static deserialize(stringifyArgs: string): VotingData {
    return new VotingData(stringifyArgs);
  }
}

/**
 * Proposal Type
 *
 *
 * */
export class VotingPower {
  owner: Address;
  delegatedPower: u32;
  stakedPower: u32;

  /**
   *
   * @param stringifyArgs
   * owner - address of owner (address);
   * votingPower - votingPower of owner (u32);
   * DelegatedPower - DelegatedPower of owner (u32);
   * StakedPower - StakedPower of owner (u32);
   **/
  constructor(stringifyArgs: string) {
    const args = new Args(stringifyArgs);
    this.owner = args.nextAddress();
    this.delegatedPower = args.nextU32();
    this.stakedPower = args.nextU32();
  }

  /**
   * serialize - Serialize the VotingPower object into a string.
   *
   * @returns {string} - VotingPower serialized as a string
   *
   * */
  serialize(): string {
    const args = new Args();
    args.add(this.owner);
    args.add(this.delegatedPower);
    args.add(this.stakedPower);
    return args.serialize();
  }
  /**
   *
   * @param stringifyArgs
   * @returns
   */
  static deserialize(stringifyArgs: string): VotingPower {
    return new VotingPower(stringifyArgs);
  }
}

/**
 * Get the actual proposalState
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - ownerProposalAddress {Address} String containing Address of Owner Proposal to retrieve right Datastore
 * - proposalId {string} String containing the proposalId to retrieve data
 * - title {string} String containing the title of the proposal
 * - description {string} String containing the description of the proposal
 * - state {i32} String containing the state of the proposal
 * - tokenName {string} String containing the tokenName of the proposal
 * - tokenSybmol {string} String containing the tokenSymbol of the proposal
 * - votingDelay {f32} Containing the votingDelay of the proposal
 * - votingPeriod {f32} Containing the votingPeriod of the proposal
 * - treshold {u32} Containing the treshold of the proposal
 * - launchDate {f32} Containing the launchDate of the proposal
 * @return {string} - ProposalState
 */
function proposalState(stringifyArgs: string): i32 {
  const args = new Args(stringifyArgs);
  const owner = args.nextAddress();
  const proposalId = args.nextString();
  // Fetch the proposal
  const proposalData = Storage.getOf(owner, 'Data'.concat(proposalId));
  if (proposalData == null) {
    return 0;
  }

  const proposal = new Proposal(stringifyArgs);

  if (
    proposal.start + proposal.votingPeriod > getDate() &&
    proposal.proposalState != u32(ProposalState.Canceled)
  ) {
    return u32(ProposalState.Executed);
  }

  if (proposal.proposalState == u32(ProposalState.Canceled)) {
    return u32(ProposalState.Canceled);
  }

  if (getDate() < proposal.start || u32(ProposalState.Created)) {
    return u32(ProposalState.Pending);
  }

  if (
    proposal.start + proposal.votingDelay + proposal.votingPeriod < getDate() &&
    proposal.start + proposal.votingDelay >= getDate()
  ) {
    return u32(ProposalState.Active);
  }
  return u32(ProposalState.Pending);
}
/**
 * CreateProposal, create a new proposal and store it in the Datastore
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the Owner of Proposal          (Address);
 * - the title of Proposal          (string);
 * - the description of Proposal    (string);
 * - the tokenName                  (string);
 * - the symbol of the Token        (string);
 * - the votingStartDate            (f32);
 * - the votingDelay of Proposal    (f32);
 * - the votingPeriod of Proposal   (f32);
 * - the treshold of Proposal       (u32);
 *
 * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
 * duration compared to the voting delay.
 * create a new proposal and Emit the event ProposalCreated
 * @return {string} - Return string with 1 or Errors
 */
export function createProposal(stringifyArgs: string): string {
  const proposal = new Proposal(stringifyArgs);

  // Generate the proposal id
  let proposalId = 'proposal';
  let exit = false;
  let index = 1;
  while (exit != true) {
    if (Storage.has(proposal.id.concat(index.toString())) == false) {
      proposalId = proposal.id.concat(index.toString());
      exit = true;
    }
    index++;
  }

  // Create the theorical Date launch of the proposal
  const lastUpdate = getDate();
  const launchDate = lastUpdate + proposal.votingDelay;
  // Store the proposal ID

  // const proposals = Storage.get('proposal');
  // // Cut the crap this can be change to a simple Storage.append("proposal", proposalId) But test u are broken :(
  // Storage.set('proposal', proposals + ',' + proposalId);

  proposal.id = proposalId;
  proposal.start = launchDate;
  proposal.lastUpdate = lastUpdate;
  proposal.proposalState = u32(ProposalState.Created);

  Storage.append('proposal', proposal.serialize());

  // Store the proposal with all params
  // Storage.append('proposal', proposalId.concat(Context.caller().toStringSegment()));
  return '1';
}
/** getProposal - Get the proposal
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * -  proposalId {string} String containing the proposalId to retrieve data
 * @return {string} - Proposal
 *
 */
export function getProposal(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const proposalId = args.nextString();
  const proposals = Storage.get('proposal');
  proposals.split(',').forEach((proposal) => {
    const propo = new Proposal(proposal);
    if (propo.id == proposalId) {
      return propo.serialize();
    }
    return '0';
  });
  return '0';
}

/**
 *
 * @param stringifyArgs
 * @returns
 */
export function deleteProposalFromStorage(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const proposalId = args.nextString();
  const proposals = Storage.get('proposal');
  const proposalsArray = proposals.split(',');

  proposalsArray.forEach((proposal) => {
    const propo = new Proposal(proposal);
    if (propo.id == proposalId) {
      proposalsArray.filter((value) => value != proposal);
      Storage.set('proposal', proposalsArray.join(','));
      return '1';
    }
    return '0';
  });

  return '0';
}

/** */
function updateProposalFromStorage(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const proposalId = args.nextString();
  const proposals = Storage.get('proposal');
  const proposalsArray = proposals.split(',');

  proposalsArray.forEach((proposal) => {
    const propo = new Proposal(proposal);
    if (propo.id == proposalId) {
      proposalsArray.fill(
        stringifyArgs,
        proposalsArray.indexOf(proposal),
        proposalsArray.indexOf(proposal),
      );
      Storage.set('proposal', proposalsArray.join(','));
      return '1';
    }
    return '0';
  });

  return '0';
}

/**
 * updateElementFromStorage - Update the element in the storage
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * -  keyElement {string} String containing the element to retrieve data
 * -  valueElement {string} String containing the value to update
 * @return {string} - Return string with 1 or Errors
 * */
function updateElementFromStorage(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const keyElement = args.nextString();
  const valueElement = args.nextString();
  const element = Storage.get(keyElement);
  element.split(',').forEach((value) => {
    if (value == keyElement) {
      Storage.set(keyElement, valueElement);
    }
  });

  return '1';
}

/**  * EditProposal, edit a proposal and store it in the Datastore with new Data
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the Owner of Proposal                 (Address);
 * - the ProposalId                        (string);
 * - the title of Proposal                 (string);
 * - state of the Proposal                 (i32);
 * - the description of Proposal           (string);
 * - the tokenName of the Token            (string);
 * - the symbol of the Token               (string);
 * - the votingDelay of Proposal           (u32);
 * - the votingPeriod of Proposal          (u32);
 * - the treshold of Proposal              (u32);
 *
 * NOTE: The proposal can be edited only if it is not Active, Executed or Canceled.
 *
 * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
 * duration compared to the voting delay.
 * @return {string} - ProposalState as u32
 */
export function editProposal(stringifyArgs: string): string {
  const proposalChange = new Proposal(stringifyArgs);
  let dataProposal: Proposal;

  // Check if the proposer is a valid address
  if (!proposalChange.owner.isValid()) {
    return 'Governor: invalid proposer address';
  }
  if (
    getProposal(
      proposalChange.owner.toStringSegment().concat(proposalChange.id),
    ) == '0'
  ) {
    return 'Proposal Not Found';
  } else {
    dataProposal = new Proposal(
      getProposal(
        proposalChange.owner.toStringSegment().concat(proposalChange.id),
      ),
    );
  }

  // Check if the proposal is in the right state
  if (
    proposalState(dataProposal.serialize()) == u32(ProposalState.Active) ||
    proposalState(dataProposal.serialize()) == u32(ProposalState.Executed) ||
    proposalState(dataProposal.serialize()) == u32(ProposalState.Canceled)
  ) {
    return 'Governor: cannot edit unavailable proposal';
  }

  createProposal(proposalChange.serialize());
  // dataProposal.id = proposalChange.id;
  // dataProposal.title = proposalChange.title;
  // dataProposal.description = proposalChange.description;
  // dataProposal.tokenName = proposalChange.tokenName;
  // dataProposal.tokenSymbol = proposalChange.tokenSymbol;
  // dataProposal.start = launchDate;
  // dataProposal.lastUpdate = lastUpdate;
  // dataProposal.proposalState = proposalState(dataProposal.serialize());
  // dataProposal.proposalTreshold = proposalChange.proposalTreshold;
  // dataProposal.votingDelay = proposalChange.votingDelay;
  // dataProposal.votingPeriod = proposalChange.votingPeriod;

  deleteProposalFromStorage(dataProposal.id);
  return '1';
}

/**  * cancelProposal, cancel a proposal and store it in the Datastore with Canceled state
 *  @param {string} proposalId - ProposalId: the id of the proposal:
 *
 * @return {string} - ProposalState
 */
export function cancelProposal(proposalId: string): string {
  // get globalProposal
  const globalProposal = Storage.get('proposal');

  // Check if the proposal is valid
  if (globalProposal == null) {
    return 'Governor: unknown proposal id';
  }
  // first try
  globalProposal.replace(proposalId, '');
  // Clean the empty space
  globalProposal.replace(',,', ',');
  if (globalProposal.startsWith(',')) {
    globalProposal.replace(',', '');
  }
  if (globalProposal.endsWith(',')) {
    globalProposal.slice(globalProposal.length);
  }
  Storage.set('proposal', globalProposal);

  // Get actual Args of the proposal
  const Dataparams = new Args(Storage.get('Data'.concat(proposalId)));

  // Set args in local variables
  const owner = Dataparams.nextString();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const proposalIdd = Dataparams.nextString();
  const title = Dataparams.nextString();
  const description = Dataparams.nextString();
  const tokenName = Dataparams.nextString();
  const tokenSymbol = Dataparams.nextString();
  const votingDelay = Dataparams.nextF32();
  const votingPeriod = Dataparams.nextF32();
  const threshold = Dataparams.nextU32();
  const launchDate = Dataparams.nextF32();

  const params = new Args();
  // set the new state of the proposal
  params.add(owner);
  params.add(proposalId);
  params.add(title);
  params.add(ProposalState.Canceled);
  params.add(description);
  params.add(tokenName);
  params.add(tokenSymbol);
  params.add(f32(votingDelay));
  params.add(f32(votingPeriod));
  params.add(u32(threshold));
  params.add(f32(launchDate));
  params.add(getDate().toString());

  Storage.set('Data'.concat(proposalId), params.serialize());
  return '1';
}
