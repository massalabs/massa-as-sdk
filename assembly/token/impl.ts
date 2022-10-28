import {Address, Storage, Context, generateEvent} from '../std/index';
import {ByteArray} from '@massalabs/as/assembly';

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
// ====                 TOKEN ATTIBUTES                ==== //
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
 * @param {string} args - byte string containing an owner's account (Address).
 *
 * @return {string} - u64
 */
export function balanceOf(args: string): string {
  const addr = Address.fromByteString(args);

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
 * @param {string} args - byte string with the following format:
 * - the recipient's account (address)
 * - the number of tokens (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function transfer(args: string): string {
  const ownerAddress = Context.caller();

  const toAddress = new Address();
  const offset = toAddress.fromStringSegment(args);

  const amount = ByteArray.fromByteString(args.substr(offset, 8)).toU64();

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
 * @param {string} args - byte string with the following format:
 * - the owner's account (address)
 * - the spender's account (address).
 *
 * @return {string} - u64
 */
export function allowance(args: string): string {
  const ownerAddress = new Address();
  const offset = ownerAddress.fromStringSegment(args);

  const spenderAddress = new Address();
  spenderAddress.fromStringSegment(args, offset);

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
 * @param {string} args - byte string with the following format:
 * - the spender's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function increaseAllowance(args: string): string {
  const ownerAddress = Context.caller();

  const spenderAddress = new Address();
  const offset = spenderAddress.fromStringSegment(args);

  const amount = ByteArray.fromByteString(args.substr(offset, 8)).toU64();

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
 * @param {string} args - byte string with the following format:
 * - the spender's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function decreaseAllowance(args: string): string {
  const ownerAddress = Context.caller();

  const spenderAddress = new Address();
  const offset = spenderAddress.fromStringSegment(args);

  const amount = ByteArray.fromByteString(args.substr(offset, 8)).toU64();

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
 * @param {string} args - byte string with the following format:
 * - the owner's account (address);
 * - the recipient's account (address);
 * - the amount (u64).
 *
 * @return {string} - boolean value ("1" or "0")
 */
export function transferFrom(args: string): string {
  const spenderAddress = Context.caller();

  const ownerAddress = new Address();
  let offset = ownerAddress.fromStringSegment(args);

  const recipientAddress = new Address();
  offset = recipientAddress.fromStringSegment(args, offset);

  const amount = ByteArray.fromByteString(args.substr(offset, 8)).toU64();

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
