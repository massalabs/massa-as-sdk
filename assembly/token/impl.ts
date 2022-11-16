/* eslint-disable valid-jsdoc */
import {Address, Storage, Context, generateEvent} from '../std/index';

import {ByteArray} from '@massalabs/as/assembly';
import {Args} from '../std/arguments';
import { ProposalState } from './enums';
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
/*
* @param {string} args - byte string with the following format:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 * */
export function delegate(delegatee: string): string {
  
return "address";
}
/*
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - the proposalOwner, to find in the right datastore  (address);
 * - the proposalId, to find id in datastore (string);
 * - the amount, of voting power (u64).
 * - the reason, For Against Abstain (string).
 * @return {string} - boolean value ("1" or "0")*/
export function castVote (stringifyArgs:string): string {

  const voter = Context.caller();
  const args = new Args(stringifyArgs);
  const proposalOwner = args.nextAddress();
  const proposalId = args.nextString();
  const amount = args.nextU64();
  const reason = args.nextString();
  const proposal = _getProposal(proposalOwner, proposalId);
  const voterDelegate = _getDelegate(voter);
  const voterPower = _getVotingPower(voter);
  const voterDelegatePower = _getVotingPower(voterDelegate);
  const voterTotalPower = voterPower + voterDelegatePower;
  const voterPowerUsed = _getVotingPowerUsed(voter);
  const voterDelegatePowerUsed = _getVotingPowerUsed(voterDelegate);
  const voterTotalPowerUsed = voterPowerUsed + voterDelegatePowerUsed;
  const voterPowerAvailable = voterTotalPower - voterTotalPowerUsed;
  
  // TODO : check if the proposal is in the datastore
  // TODO : check if the proposal is Active
  // TODO : check if the proposal accept the reason format
  // TODO : check if the proposal accept the amount format
  // TODO : check if the proposal accept the proposalId format
  // TODO : check if the proposal accept the proposalOwner format

  if(!proposalOwner.isValid() || isNaN(amount) || !isString(proposalId) || !isString(reason)){
    return 'Voting : Invalid arguments';
  }

  if (reason != "For" || reason != "Against" || reason != "Abstain"){
    return 'Voting : Invalid reason';
  }

  if (amount < 0){
    return 'Voting : Invalid amount';
  }

  // TODO : check if the proposal State is Active
  if (Storage.hasOf(proposalOwner, "Data".concat(proposalId))){
      let dataProposal = Storage.getOf(proposalOwner, "Data".concat(proposalId));
      let argsproposal = new Args(dataProposal);
      const owner = args.nextAddress();
      const id = args.nextString();
      const title = args.nextString();
      const state = args.nextString();
      
      if (owner != proposalOwner || id != proposalId || state != "Active"){
        return 'Voting : Invalid proposal';
      }

      
      
      // TODO : add the vote to the datastore
      return 'Voting : Vote added';
          
    }
  return "address";
}

function updateVotingPower(amount: u64, reason: string): void {
  const voter = Context.caller();
  const currentVotes = _votes(voter);

  const newVotes = currentVotes + amount;

  if (newVotes < currentVotes) {
    throw new Error('Overflow');
  }

  _setVotes(voter, newVotes);
}

// ==================================================== //
// ====                 GOVERNANCE                 ==== //
// ==================================================== //


/* Return ProposalState
 * @param {string} proposalId - String to identify the proposal:
 * @return {string} - ProposalState*/
// --
export function proposalState(proposalId: string): string {
    // Fetch the proposal
    const proposalData = Storage.get("Data".concat(proposalId));   
    if (proposalData == null) {
      return"Governor: unknown proposal id";
    }
    const args = new Args(proposalData);
    const owner = args.nextAddress();
    const id = args.nextString();
    const title = args.nextString();
    const state = args.nextString();
    const description = args.nextString();
    const tokenName = args.nextString();
    const tokenSymbol = args.nextString();
    const votingDelay = args.nextString();
    const votingPeriod = args.nextI64();
    const treshold = args.nextString();
    const launchDate = args.nextI64();
    const lastUpdate = args.nextString();

    let proposalState; 

        if (proposalState == "Executed") {
            return ProposalState.Executed;
        }

        if (proposalState == "Canceled") {
            return ProposalState.Canceled;
        }

        if (Date.now() < launchDate || proposalState == "Created") {
            return ProposalState.Pending;
        }

        if ((launchDate + votingPeriod) < Date.now() && launchDate >= Date.now())   {
            return ProposalState.Active;
        }

        // TODO LFA : Maybe we will delay this implementation to the next version
        // if (_voteSucceeded(proposalId)) {
        //     return ProposalState.Succeeded;
        // } else {
        //     return ProposalState.Defeated;
        // }
        return ProposalState.Succeeded;
}
    /**
     * @notice module:user-config
     * @dev Delay, in number of blocks, between the vote start and vote ends.
     *
     * NOTE: Struct Proposal Storage register
     * Key : proposal 
     * Values : *proposalid*
     * 
     * NOTE: Struct DataProposal Storage register
     * Key : Data*proposalid*
     * Values : String Args
     * 
     *  * @param {string} stringifyArgs - Args object serialized as a string containing:
     * - the Owner of Proposal          (Address);
     * - the title of Proposal          (string);
     * - the description of Proposal    (string);
     * - the tokenName                  (string);
     * - the symbol of the Token        (string);
     * - the votingDelay of Proposal    (u64);
     * - the votingPeriod of Proposal   (u64);
     * - the treshold of Proposal       (u64);
     * 
     * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
     * duration compared to the voting delay.
     * create a new proposal and Emit the event ProposalCreated
     */
export function createProposal(stringifyArgs:string): string {
    // Declaration of args
    const args = new Args(stringifyArgs);
    // Settings of args in local variables
    const owner = args.nextAddress();
    const title = args.nextString();
    const description = args.nextString();
    const tokenName = args.nextString();
    const tokenSymbol = args.nextString();
    const votingDelay = args.nextU64();
    const votingPeriod = args.nextU64();
    const threshold = args.nextU64();

    // Check if the proposer is a valid address
    if (!owner.isValid()) {
        return 'Governor: invalid proposer address';
    }
    if (votingDelay < 0) {
        return 'Governor: invalid voting delay';
    }
    if (votingPeriod < 0) {
        return 'Governor: invalid voting period';
    }
    if (threshold < 0) {
        return 'Governor: invalid proposal threshold';
    }

    // Generate the proposal id
    let proposalId = 'proposal';
    let exit = false;
    for (let index = 1; exit == true; index++) {
        if (Storage.has(proposalId.concat(index.toString())) == false) {
            exit = true;
            proposalId = proposalId.concat(index.toString());
        }
    }

    // Create the theorical Date launch of the proposal
    const lastUpdate = Date.now();
    const launchDate = lastUpdate + votingDelay;
    // Store the proposal ID
    Storage.append('proposal', proposalId);

    // Concat params to store in datastore
    const params = new Args();
    params.add(owner);
    params.add(proposalId);
    params.add(title);
    params.add('Created');
    params.add(description);
    params.add(tokenName);
    params.add(tokenSymbol);
    params.add(votingDelay);
    params.add(votingPeriod);
    params.add(threshold);
    params.add(launchDate);
    params.add(lastUpdate);

    // Store the proposal with all params
    Storage.set('Data'.concat(proposalId), params.serialize());
    const argsVote = new Args();
    argsVote.add("FOR:0");
    argsVote.add("AGAINST:0");
    argsVote.add("ABSTAIN:0");
    // Create the storage for the votes
    Storage.set('Votes'.concat(proposalId), argsVote.serialize());
  return '1';
}
/**  * 
     *  * @param {string} stringifyArgs - Args object serialized as a string containing:
     * - the Owner of Proposal                 (Address);
     * - the ProposalId                        (string);
     * - the title of Proposal                 (string);
     * - the description of Proposal           (string);
     * - the tokenName of the Token            (string);
     * - the symbol of the Token               (string);
     * - the votingDelay of Proposal           (u64);
     * - the votingPeriod of Proposal          (u64);
     * - the treshold of Proposal              (u64);
     * 
     * NOTE: The proposal can be edited only if it is not Active, Executed or Canceled.
     * 
     * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
     * duration compared to the voting delay.
     * return {string} - ProposalState
     */
export function editProposal (stringifyArgs:string): string {
    // Declaration of args
    const args = new Args(stringifyArgs);

    // Settings of args in local variables
    const owner = args.nextAddress();
    const proposalId = args.nextString();
    const title = args.nextString();
    const state = args.nextString();
    const description = args.nextString();
    const tokenName = args.nextString();
    const tokenSymbol = args.nextString();
    const votingDelay = args.nextU64();
    const votingPeriod = args.nextU64();
    const threshold = args.nextU64();

    // Check if the proposer is a valid address
    if (!owner.isValid()) {
        return "Governor: invalid proposer address";
    }
    if (votingDelay < 0) {
        return "Governor: invalid voting delay";
    }
    if (votingPeriod < 0) {
        return "Governor: invalid voting period";
    }
    if (threshold < 0) {
        return "Governor: invalid proposal threshold";
    }
    // Check if the proposal is in the right state
    if (proposalState(proposalId) == ProposalState.Active || 
        proposalState(proposalId) == ProposalState.Executed || 
        proposalState(proposalId) == ProposalState.Canceled) {
        return "Governor: cannot edit unavailable proposal";
    }

    if(Storage.has("Data".concat(proposalId)) == false) {
        return "Governor: invalid proposal id";
    }

    // Create the theorical Date launch of the proposal
    const lastUpdate = Date.now();
    const launchDate = lastUpdate + votingDelay;

    // Concat params to store in datastore
    const params = new Args();
    params.add(owner);
    params.add(proposalId);
    params.add(title);
    params.add(proposalState(proposalId));
    params.add(description);
    params.add(tokenName);
    params.add(tokenSymbol);
    params.add(votingDelay);
    params.add(votingPeriod);
    params.add(threshold);
    params.add(launchDate);
    params.add(lastUpdate);

    // Store the proposal with all params
    Storage.set("Data".concat(proposalId), params.serialize());
    return "1";
}

// function setOwnerProposalAddress(ownerAddress: Address, proposalId:u64): string {
//     // Check if the ownerAddress is a valid address
//     if (!ownerAddress.isValid()) {
//         return "Governor: invalid owner address";
//     }
//     // Set the ownerAddress in Storage
//     Storage.set(
//       ownerAddress.toByteString().concat(proposalId.toString()),
//       "ownerProposalAddress",
//     );
//     if (Storage.get(ownerAddress.toByteString().concat(proposalId.toString())) == null) {
//         return "Governor: invalid owner address";
//     }
//     else{
//         return "Governor: valid owner address";
//     }
// }

export function cancelProposal(proposalId: string): string {

  //get globalProposal 
  const globalProposal = Storage.get("proposal");
  
  // Check if the proposal is valid
  if (globalProposal == null) {
      return "Governor: unknown proposal id";
  }
    // first try
    globalProposal.replace(proposalId, "");
    // Clean the empty space
    globalProposal.replace(",,", ",");
    if (globalProposal.startsWith(",")) {
      globalProposal.replace(",", "");
    }
    if (globalProposal.endsWith(",")) {
      globalProposal.slice(globalProposal.length);
    }
    //Get actual Args of the proposal
    const Dataparams = new Args(Storage.get("Data".concat(proposalId)));
    
    // Set args in local variables
    const owner = Dataparams.nextString();
    const proposalIdd = Dataparams.nextString();
    const title = Dataparams.nextString();
    const description = Dataparams.nextString();
    const tokenName = Dataparams.nextString();
    const tokenSymbol = Dataparams.nextString();
    const votingDelay = Dataparams.nextU64();
    const votingPeriod = Dataparams.nextU64();
    const threshold = Dataparams.nextU64();
    const launchDate = Dataparams.nextU64();

    // set the new state of the proposal 
    params.add(owner);
    params.add(proposalId);
    params.add(title);
    params.add(description);
    params.add(tokenName);
    params.add(tokenSymbol);
    params.add(votingDelay);
    params.add(votingPeriod);
    params.add(threshold);
    params.add(launchDate);
    params.add(Date.now().toString())
    params.add("Canceled");

    const dataProposal = Storage.set("Data".concat(proposalId), "Canceled");
    Storage.set()
    // OLD WAY Second Try : CLEAN CODE BEFORE PUSH AND SEE IF IT WORKS
    // Start LFA CLEAN
    // // Split proposals to match with the proposalId
    // let splittedglobalProposal = globalProposal.split(",");

    // // Get indexProposal
    // let index = splittedglobalProposal.indexOf(proposalId);

    // // remove proposalId from globalProposal
    // let result = splittedglobalProposal.splice(index, 1);    

    // END LFA CLEAN 
    Storage.set(
      "proposal",globalProposal)

    return "1";
  }
export function setEndVote(deadline: string): string {
    return "deadline";
}

export function setStartVote(start: string): string {
    return "start";
  }
    /**
     * @notice module:user-config
     * @dev Delay, in number of blocks, between the vote start and vote ends.
     *
     * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
     * duration compared to the voting delay.
     */
export function setVotingPeriod(period: string): string {
    return "period";
}
    /**
     * @notice module:user-config
     * @dev Delay, in number of block, between the proposal is created and the vote starts. This can be increassed to
     * leave time for users to buy voting power, or delegate it, before the voting of a proposal starts.
     */
export function setVotingDelay(delay: string): string {
    return "threshold";
}

