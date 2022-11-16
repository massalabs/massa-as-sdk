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
  const amount = args.nextU64();
  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }
    
  updateVotingPower(args.serialize());
  return "address";
}

/**
 * This function is to delegate voting power from one Address to Another Addres
 * @param {string} stringifyArgs - byte string with the following format:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 * */
export function updateVotingPower(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const ownerAddress = args.nextAddress();
  const recipientAddress = args.nextAddress();
  const amount = args.nextU64();

  if (!ownerAddress.isValid() || !recipientAddress.isValid() || isNaN(amount)) {
    return '0';
  }
  
  const ownerBalance = _balance(ownerAddress);
  const recipientBalance = _balance(recipientAddress);

  Storage.setOf(ownerAddress, "DelegatedPower", (amount + ownerBalance).toString());
  Storage.setOf(recipientAddress, "DelegatedPower", (recipientBalance - amount).toString());
  return "1";}

/**
 *
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

  if(!proposalOwner.isValid() || isNaN(amount) || !isString(proposalId) || !isString(reason)){
    return 'Voting : Invalid arguments';
  }

  if (!reason.includes("For") || !reason.includes("Against")  || !reason.includes("Abstain")){
    return 'Voting : Invalid reason';
  }

  // Check if the proposal State is Active
  if (Storage.hasOf(proposalOwner, "Data".concat(proposalId))){
    let dataProposal = Storage.getOf(proposalOwner, "Data".concat(proposalId));
    let argsproposal = new Args(dataProposal);
    const owner = argsproposal.nextAddress();
    const id = argsproposal.nextString();
    const title = argsproposal.nextString();
    const state = argsproposal.nextString();
    // Using the voter address to get VotinData for User  
    const votingDataString = "VotingData".concat(proposalId.concat(voter.toByteString()));
    
    if (owner != proposalOwner || id != proposalId || state != "Active"){
      return 'Voting : Invalid proposal';
    }
    const argsFuncVotingPower = new Args();
    argsFuncVotingPower.add(owner);
    argsFuncVotingPower.add(id);
    const votingPowerAvailable =  getVotingPowerForAProposal(argsFuncVotingPower.serialize());
    
    // Fetch VotingDataUser from Storage 
    const votingDataUser = Storage.get(votingDataString);
    // Fetch votingDataProposal from Storage 
    const votingDataProposal = Storage.getOf(proposalOwner,"VotingData".concat(proposalId));
    

    // Push DataStore Proposal to local variables
    const argsVotingDataProposal = new Args(votingDataProposal);
    let forUserCount = argsVotingDataProposal.nextU64();
    let againstUserCount = argsVotingDataProposal.nextU64();
    let abstainUserCount = argsVotingDataProposal.nextU64();

    // Push DataStoreUser to local variables
    const argsVotingDataUser = new Args(votingDataUser);
    let forProposalCount = argsVotingDataUser.nextU64();
    let againstProposalCount = argsVotingDataUser.nextU64();
    let abstainProposalCount = argsVotingDataUser.nextU64();

    const argsVotingDataUserToStore = new Args();
    const argsVotingDataProposalToStore = new Args();
        
    let valueToStore : number;
    amount > votingPowerAvailable ? valueToStore = votingPowerAvailable : valueToStore = amount;
    // Store Data User depend on reason
    // Store Data proposal depend on reason 
    switch (reason) {
      case "For":
        // Store Voting User Data to DataStore        
        argsVotingDataUserToStore.add(valueToStore);
        argsVotingDataUserToStore.add(againstUserCount);
        argsVotingDataUserToStore.add(abstainUserCount);
        
        // Store Data Proposal to DataStore
        argsVotingDataProposalToStore.add((forProposalCount + valueToStore));
        argsVotingDataProposalToStore.add((againstProposalCount));
        argsVotingDataProposalToStore.add((abstainProposalCount));

        break;
      case "Against":
        // Store Voting User Data to DataStore 
        argsVotingDataUserToStore.add(forUserCount);
        argsVotingDataUserToStore.add(valueToStore);
        argsVotingDataUserToStore.add(abstainUserCount);

        // Store Data Proposal to DataStore
        argsVotingDataProposalToStore.add((forProposalCount));
        argsVotingDataProposalToStore.add((againstProposalCount + valueToStore));
        argsVotingDataProposalToStore.add((abstainProposalCount));

        break;
      case "Abstain":
        // Store Voting User Data to DataStore 
        argsVotingDataUserToStore.add(forUserCount);
        argsVotingDataUserToStore.add(againstUserCount);
        argsVotingDataUserToStore.add(valueToStore);

        // Store Data Proposal to DataStore
        argsVotingDataProposalToStore.add((forProposalCount));
        argsVotingDataProposalToStore.add((againstProposalCount));
        argsVotingDataProposalToStore.add((abstainProposalCount + valueToStore));
      default:
        break;
    }
    Storage.set(votingDataString, argsVotingDataUserToStore.serialize());
    Storage.setOf(proposalOwner,votingDataString, argsVotingDataUserToStore.serialize());

    // Process to Update votingData
    Storage.set(votingDataString, amount.toString() );
      
    return 'Voting : Vote added';
          
  }
  return "Voting: Proposal not found";
}
/**
 * Decreases the allowance of the spender the on owner's account by the amount.
 *
 * This function can only be called by the owner.
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - owner - ProposalAddressOwner (address);
 * - proposalId - id of Proposal (string).
 *  
 *
 * @return {u64} - boolean value ("1" or "0")
 */
function getVotingPowerForAProposal(stringifyArgs: string ): u64{
  
  let args = new Args(stringifyArgs);
  const owner = args.nextAddress();
  const id = args.nextString();

  const voter = Context.caller();
  const bal = _balance(voter);

  // Fetch VotingData
  const votingData = Storage.get("VotingData".concat(id).concat(voter.toByteString()));
  // Put Data in local variable
  const votingDataArgs = new Args(votingData);
  // forCount contains the value of vote used for this proposal
  const forCount = votingDataArgs.nextU64();
  const againstCount = votingDataArgs.nextU64();
  const abstainCount = votingDataArgs.nextU64();

  // Sum of all voting power from this address involved in this proposal to define the voting power available 
  if(bal > 0){
    return (forCount + againstCount + abstainCount - bal);
  }
  return 0;
}
/**
 * GetProposalData from Specific Address and ProposalId 
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u64).
 * - proposalId (address);
 * - withArgs (number) 0 WithoutArgs 1 With Args;
 *
 * @return {string} - Return string with ProposalData 
 */
export function getProposalData (stringifyArgs:string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  const withArgs = args.nextU64();
  let result ;
  result = Storage.getOf(owner,"Data".concat(id));
  return result;
}
/**
 * GetUserVotingData from Specific Address and ProposalId 
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u64).
 * - proposalId (address);
 * - withArgs (number)
 *
 * @return {string} - Return string with ProposalData  
 */
export function getUserVotingData (stringifyArgs:string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  const withArgs = args.nextU64();
  let result;
  result = Storage.getOf(owner,"VotingData".concat(id.concat(owner.toByteString())));
  return result;
}
/**
 * GetUserVotingData from Specific Address and ProposalId 
 *
 * @param {string} stringifyArgs - Args object serialized as a string containing:
 * - OwnerAddress (u64).
 * - proposalId (address);
 * - withArgs (number)
 *
 * @return {string} - Return string with ProposalData  
 */
export function getProposalVotingData (stringifyArgs:string): string {
  const args = new Args();
  const owner = args.nextAddress();
  const id = args.nextString();
  const withArgs = args.nextU64();
  let result;
  result = Storage.get("VotingData".concat(id));
  return result;
}

// ==================================================== //
// ====                 GOVERNANCE                 ==== //
// ==================================================== //

/**
 * Get the actual proposalState
*
* @param {string} stringifyArgs - Args object serialized as a string containing:
* - ownerProposalAddress {Address} String containing Address of Owner Proposal to retrieve right Datastore
* - proposalId {string} String containing the proposalId to retrieve data
* - title
* - description
* - state
* - tokenName
* - tokenSybmol
* - votingDelay
* - votingPeriod
* - treshold
* - launchDate
* - lastUpdate
* @return {string} - ProposalState
*/
function proposalState(stringifyArgs: string): string {
  const args = new Args(stringifyArgs);
  const owner = args.nextAddress();
  const proposalId = args.nextString();
  // Fetch the proposal
  const proposalData = Storage.getOf(owner,"Data".concat(proposalId));
  if (proposalData == null) {
    return"Governor: unknown proposal id";
  }
  const argsFromData = new Args(proposalData);
  const ownerProposal = argsFromData.nextAddress();
  const id = argsFromData.nextString();
  const title = argsFromData.nextString();
  const state = argsFromData.nextString();
  const description = argsFromData.nextString();
  const tokenName = argsFromData.nextString();
  const tokenSymbol = argsFromData.nextString();
  const votingDelay = argsFromData.nextString();
  const votingPeriod = argsFromData.nextI64();
  const treshold = argsFromData.nextString();
  const launchDate = argsFromData.nextI64();
  const lastUpdate = argsFromData.nextString();

  let proposalState; 

  if (launchDate + votingPeriod > Date.now() && state != "Canceled") {
    return ProposalState.Executed;
  }

  if (state == "Canceled") {
    return ProposalState.Canceled;
  }

  if (Date.now() < launchDate || proposalState == "Created") {
    return ProposalState.Pending;
  }

  if ((launchDate + votingPeriod) < Date.now() && launchDate >= Date.now())   {
    return ProposalState.Active;
  }

  return ProposalState.Pending;

}
/**
     * CreateProposal, create a new proposal and store it in the Datastore
     * @param {string} stringifyArgs - Args object serialized as a string containing:
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
     * @return {string} - Return string with 1 or Errors
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
  // Intialize the VotingData in Storage
  const argsVote = new Args();
  argsVote.add("0");
  argsVote.add("0");
  argsVote.add("0");
  // Create the storage for the votes
  Storage.set('VotingData'.concat(proposalId), argsVote.serialize());
  return '1';
}
/**  * EditProposal, edit a proposal and store it in the Datastore with new Data
     * @param {string} stringifyArgs - Args object serialized as a string containing:
     * - the Owner of Proposal                 (Address);
     * - the ProposalId                        (string);
     * - the title of Proposal                 (string);
     * - state of the Proposal                 (string);
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
     * @return {string} - ProposalState
     */
export function editProposal (stringifyArgs:string): string {
  // Declaration of args
  const args = new Args(stringifyArgs);

  // Settings of args in local variables
  const owner = args.nextAddress();
  const proposalId = args.nextString();
  const title = args.nextString();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**  * cancelProposal, cancel a proposal and store it in the Datastore with Canceled state
     *  @param {string} proposalId - ProposalId: the id of the proposal:
     * 
     * @return {string} - ProposalState
     */
export function cancelProposal(proposalId: string): string {

  // get globalProposal 
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
  Storage.set(
    "proposal",globalProposal)

  // Get actual Args of the proposal
  const Dataparams = new Args(Storage.get("Data".concat(proposalId)));
    
  // Set args in local variables
  const owner = Dataparams.nextString();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const proposalIdd = Dataparams.nextString();
  const title = Dataparams.nextString();
  const description = Dataparams.nextString();
  const tokenName = Dataparams.nextString();
  const tokenSymbol = Dataparams.nextString();
  const votingDelay = Dataparams.nextU64();
  const votingPeriod = Dataparams.nextU64();
  const threshold = Dataparams.nextU64();
  const launchDate = Dataparams.nextU64();
  
  const params = new Args();
  // set the new state of the proposal 
  params.add(owner);
  params.add(proposalId);
  params.add(title);
  params.add("Canceled");
  params.add(description);
  params.add(tokenName);
  params.add(tokenSymbol);
  params.add(votingDelay);
  params.add(votingPeriod);
  params.add(threshold);
  params.add(launchDate);
  params.add(Date.now().toString())

  Storage.set("Data".concat(proposalId), params.serialize());
  return "1";
}


