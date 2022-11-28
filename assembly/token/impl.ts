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
/** cancelDelegate
 * */
export function cancelDelegate(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  // To receive delegate power from the owner
  const ownerAddress = args.nextAddress();
  // To take delegate power from the recipient
  const targetAddress = args.nextAddress();
  const amount = args.nextI32();

  if (!ownerAddress.isValid() || !targetAddress.isValid() || isNaN(amount)) {
    return '0';
  }

  const ownerBalance = _balance(ownerAddress);
  if (ownerBalance < amount) {
    return '0';
  }
  if (Context.caller().toByteString() == ownerAddress.toByteString()) {
    removeVotingPower(args.serialize());
  }
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
export function removeVotingPower(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const targetAddress = args.nextAddress();
  let amount = args.nextU32();
  let amountToTransfer = amount;
  const votingPowers = Storage.get('VotingPower').split(',');

  const delegatePowerTxGlobal = Storage.get('DelegatePowerTx').split(',');

  for (let index = 0; index < delegatePowerTxGlobal.length; index++) {
    const element = new DelegatePowerTx(delegatePowerTxGlobal[index]);
    if (
      element.owner.toByteString() == Context.caller().toByteString() &&
      element.recipient.toByteString() == targetAddress.toByteString()
    ) {
      // Amount of Tx is greater than delegate power to be removed
      if (element.amount >= amount) {
        element.amount -= amount;
        delegatePowerTxGlobal[index] = element.serialize();
        Storage.set('DelegatePowerTx', delegatePowerTxGlobal.join(','));
        break;
      }
      // Tx amount is less than delegate power to be removed
      if (element.amount <= amount) {
        amount -= amount;
        delegatePowerTxGlobal.splice(index, 1);
        Storage.set('DelegatePowerTx', delegatePowerTxGlobal.join(','));
      }
    }
  }

  for (let index = 0; index < votingPowers.length; index++) {
    const votingPower = new VotingPower(votingPowers[index]);
    if ((votingPower.owner = ownerAddress)) {
      votingPower.stakedPower - amountToTransfer - amount;
      votingPowers[index] = votingPower.serialize();
    }
    if ((votingPower.owner = targetAddress)) {
      votingPower.delegatedPower - amountToTransfer - amount;
      votingPowers[index] = votingPower.serialize();
    }
  }

  if (!ownerAddress.isValid() || !targetAddress.isValid() || isNaN(amount)) {
    return '0';
  }
  Storage.set('VotingPower', votingPowers.join(','));
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
  const votingPowers = Storage.get('VotingPower').split(',');

  for (let index = 0; index < votingPowers.length; index++) {
    const votingPower = new VotingPower(votingPowers[index]);
    if ((votingPower.owner = ownerAddress)) {
      votingPower.stakedPower += amount;
      votingPowers[index] = votingPower.serialize();
    }
    if ((votingPower.owner = recipientAddress)) {
      votingPower.delegatedPower += amount;
      votingPowers[index] = votingPower.serialize();
    }
  }
  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }
  Storage.set('VotingPower', votingPowers.join(','));
  // register DelegatePowerTx
  const argsTx = new Args();
  argsTx.add(ownerAddress);
  argsTx.add(recipientAddress);
  argsTx.add(amount);
  argsTx.add(f32(getDate()));

  Storage.append('DelegatePowerTx', argsTx.serialize());
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

  // Fetch VotingDataUser from Storage
  const votingDataUser = new VotingData(
    Storage.get('VotingData'.concat(proposalId).concat(voter.toByteString())),
  );

  if (
    argsproposal.id != proposalId ||
    argsproposal.proposalState != u32(ProposalState.Active)
  ) {
    return 'Voting : Invalid proposal';
  }
  const votingPowerAvailable = getVotingPowerForAProposal(argsproposal.id);

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
  const votingPowers = Storage.get('VotingPower'.concat(proposalId)).split(',');

  for (let index = 0; index < votingPowers.length; index++) {
    const argsVotingPower = new VotingPower(votingPowers[index]);
    if (argsVotingPower.owner == voter) {
      // Calculate Voting Power
      votingPowerUser =
        argsVotingPower.delegatedPower + bal - argsVotingPower.stakedPower;
    }
  }

  // Fetch Actual VotingData from Storage
  let votingPowerNonAvailable = 0;
  const votingDatas = Storage.get('VotingData'.concat(proposalId)).split(',');

  for (let index = 0; index < votingDatas.length; index++) {
    const userVotingData = new VotingData(votingDatas[index]);
    if (userVotingData.owner == voter) {
      votingPowerNonAvailable =
        userVotingData.voteFor +
        userVotingData.voteAgainst +
        userVotingData.voteAbstain;
    }
  }
  return votingPowerUser - votingPowerNonAvailable;
}

// ==================================================== //
// ====                 GOVERNANCE                 ==== //
// ==================================================== //

/**
 * Proposal Class
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
 * DelegatePowerTx contains the data for a delegate power transaction.
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - owner - address of owner (address);
 * - delegate - address of delegate (address);
 * - amount - amount of power to delegate (u32);
 * - start - start of delegation (f32);
 */
export class DelegatePowerTx {
  owner: Address;
  recipient: Address;
  amount: u32;
  start: f32;

  /**
   *
   * @param stringifyArgs
   */
  constructor(stringifyArgs: string) {
    const args = new Args(stringifyArgs);
    this.owner = args.nextAddress();
    this.recipient = args.nextAddress();
    this.amount = args.nextU32();
    this.start = args.nextF32();
  }
  /**
   *
   * @returns
   */
  serialize(): string {
    const args = new Args();
    args.add(this.owner);
    args.add(this.recipient);
    args.add(this.amount);
    args.add(this.start);
    return args.serialize();
  }
  /**
   *
   * @param stringifyArgs
   * @returns
   */
  static deserialize(stringifyArgs: string): DelegatePowerTx {
    return new DelegatePowerTx(stringifyArgs);
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
function proposalState(proposalId: string): i32 {
  // Fetch the proposal
  if (proposalId == null) {
    return 0;
  }

  const proposal = new Proposal(getProposal(proposalId));

  if (
    proposal.start + proposal.votingPeriod > getDate() &&
    proposal.proposalState != u32(ProposalState.Canceled)
  ) {
    generateEvent(createEvent('proposalState', [proposalId, 'Executed']));
    return u32(ProposalState.Executed);
  }

  if (proposal.proposalState == u32(ProposalState.Canceled)) {
    generateEvent(createEvent('proposalState', [proposalId, 'Canceled']));
    return u32(ProposalState.Canceled);
  }

  if (getDate() < proposal.start || u32(ProposalState.Created)) {
    generateEvent(createEvent('proposalState', [proposalId, 'Pending']));
    return u32(ProposalState.Pending);
  }

  if (
    proposal.start + proposal.votingDelay + proposal.votingPeriod < getDate() &&
    proposal.start + proposal.votingDelay >= getDate()
  ) {
    generateEvent(createEvent('proposalState', [proposalId, 'Active']));
    return u32(ProposalState.Active);
  }
  generateEvent(createEvent('proposalState', [proposalId, 'Pending']));
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

  proposal.id = proposalId;
  proposal.start = launchDate;
  proposal.lastUpdate = lastUpdate;
  proposal.proposalState = u32(ProposalState.Created);

  Storage.append('proposal', proposal.serialize());
  generateEvent(createEvent('createProposal', [proposalId]));
  return '1';
}
/** getProposal - Get the proposal
 *
 * @param {string} proposalId - String containing the proposalId to retrieve data
 * -  proposalId {string} String containing the proposalId to retrieve data
 * @return {string} - Proposal
 *
 */
export function getProposal(proposalId: string): string {
  const proposals = Storage.get('proposal').split(',');
  for (let index = 0; index < proposals.length; index++) {
    const propo = new Proposal(proposals[index]);
    if (propo.id == proposalId) {
      return propo.serialize();
    }
    return '0';
  }
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
  const proposals = Storage.get('proposal').split(',');

  for (let index = 0; index < proposals.length; index++) {
    const propo = new Proposal(proposals[index]);
    if (propo.id == proposalId) {
      proposals.filter((value) => value != proposals[index]);
      Storage.set('proposal', proposals.join(','));
      generateEvent(
        createEvent('deleteProposalFromStorage', [proposalId, stringifyArgs]),
      );
      return '1';
    }
    return '0';
  }

  return '0';
}

/** */
function updateProposalFromStorage(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const proposalId = args.nextString();
  const proposals = Storage.get('proposal').split(',');

  for (let index = 0; index < proposals.length; index++) {
    const propo = new Proposal(proposals[index]);
    if (propo.id == proposalId) {
      proposals.fill(
        stringifyArgs,
        proposals.indexOf(proposals[index]),
        proposals.indexOf(proposals[index]),
      );
      Storage.set('proposal', proposals.join(','));
      generateEvent(
        createEvent('updateProposalFromStorage', [proposalId, stringifyArgs]),
      );
      return '1';
    }
  }
  return '0';
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
  updateProposalFromStorage(proposalChange.serialize());
  return '1';
}

/**  * cancelProposal, cancel a proposal and store it in the Datastore with Canceled state
 *  @param {string} proposalId - ProposalId: the id of the proposal:
 *
 * @return {string} - ProposalState
 */
export function cancelProposal(proposalId: string): string {
  // get globalProposal
  const proposal = new Proposal(getProposal(proposalId));
  proposal.proposalState = ProposalState.Canceled;
  editProposal(proposal.serialize());
  generateEvent(
    createEvent('cancelProposal', [
      proposalId,
      proposal.proposalState.toString(),
    ]),
  );
  return '1';
}
