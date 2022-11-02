import {Address, call} from '../std/index';
import {Currency, Amount, ByteArray} from '@massalabs/as/assembly';

/**
 * The Massa's standard token implementation wrapper.
 *
 * This class can be used to wrap a smart contract implementing
 * Massa standard token.
 * All the serialization/deserialization will handled here.
 *
 * ```assemblyscript
 *  ...
 *  const coin = new TokenWrapper(sc_address);
 *  const coinName = coin.Name();
 *  const bal = coin.BalanceOf(myAddress);
 *  print("balance: " + bal.toString() + " of token: " + coinName);
 * ...
 * ```
 */
export class TokenWrapper {
  _origin: Address;
  _currency: Currency;
  _name: string;

  /**
   * Wraps a smart contract exposing standard token FFI.
   *
   * @param {Address} at - Address of the smart contract.
   */
  constructor(at: Address) {
    this._origin = at;
    this._name = call(this._origin, 'name', '', 0);
    this._currency = new Currency(
      this._name,
      U8.parseInt(call(this._origin, 'decimals', '', 0)),
    );
  }

  /**
   * Returns the version of the smart contract.
   * This versioning is following the best practices defined in https://semver.org/.
   *
   * @return {string}
   */
  version(): string {
    return call(this._origin, 'version', '', 0);
  }

  /**
   * Returns the name of the token.
   *
   * @return {string} - name of the token.
   */
  name(): string {
    return this._name;
  }

  /** Returns the symbol of the token.
   *
   * @return {string} token symbol.
   */
  symbol(): string {
    return call(this._origin, 'symbol', '', 0);
  }

  /** Returns the decimals of the token.
   *
   * @return {string} token decimals.
   */
  decimals(): string {
    return call(this._origin, 'decimals', '', 0);
  }

  /**
   * Returns the total token supply.
   *
   * The number of tokens that were initially minted.
   *
   * @return {Amount} number of minted tokens.
   */
  totalSupply(): Amount {
    return this.toAmount(call(this._origin, 'totalSupply', '', 0));
  }

  /**
   * Check if amount is valid and if amount.currency matches this
   * smart contract currency.
   *
   * @param {Amount} amount
   *
   * @return {boolean}
   */
  private checkAmount(amount: Amount): boolean {
    if (!amount.isValid()) {
      return false;
    }

    return amount.currency() == this._currency;
  }

  /**
   * Returns an amount given a value.
   *
   * @param {string} value - u64 in a string
   * @return {Amount}
   */
  private toAmount(value: string): Amount {
    const v = U64.parseInt(value);
    return isNaN(v) ? Amount.invalid() : new Amount(v, this._currency);
  }

  /**
   * Returns the balance of an account.
   *
   * @param {Address} account
   *
   * @return {Amount}
   */
  balanceOf(account: Address): Amount {
    return this.toAmount(
      call(this._origin, 'balanceOf', account.toByteString(), 0),
    );
  }

  /**
   * Transfers tokens from the caller's account to the recipient's account.
   *
   * @param {Address} toAccount
   * @param {Amount} nbTokens
   *
   * @return {boolean}
   */
  transfer(toAccount: Address, nbTokens: Amount): boolean {
    if (!this.checkAmount(nbTokens)) {
      return false;
    }

    return (
      call(
        this._origin,
        'transfer',
        toAccount
          .toStringSegment()
          .concat(ByteArray.fromU64(nbTokens.value()).toByteString()),
        0,
      ) == '1'
    );
  }

  /**
   * Returns the allowance set on the owner's account for the spender.
   *
   * @param {Address} ownerAccount
   * @param {Address} spenderAccount
   *
   * @return {Amount}.
   */
  allowance(ownerAccount: Address, spenderAccount: Address): Amount {
    return this.toAmount(
      call(
        this._origin,
        'allowance',
        ownerAccount.toStringSegment().concat(spenderAccount.toStringSegment()),
        0,
      ),
    );
  }

  /**
   * Increases the allowance of the spender on the owner's account
   * by the given amount.
   *
   * This function can only be called by the owner.
   *
   * @param {Address} spenderAccount
   * @param {Amount} nbTokens
   *
   * @return {boolean}
   */
  increaseAllowance(spenderAccount: Address, nbTokens: Amount): boolean {
    if (!this.checkAmount(nbTokens)) {
      return false;
    }

    return (
      call(
        this._origin,
        'increaseAllowance',
        spenderAccount
          .toStringSegment()
          .concat(ByteArray.fromU64(nbTokens.value()).toByteString()),
        0,
      ) == '1'
    );
  }

  /**
   * Dereases the allowance of the spender on the owner's account
   * by the given amount.
   *
   * This function can only be called by the owner.
   *
   * @param {Address} spenderAccount
   * @param {Amount} nbTokens
   *
   * @return {boolean}
   */
  decreaseAllowance(spenderAccount: Address, nbTokens: Amount): boolean {
    if (!this.checkAmount(nbTokens)) {
      return false;
    }

    return (
      call(
        this._origin,
        'decreaseAllowance',
        spenderAccount
          .toStringSegment()
          .concat(ByteArray.fromU64(nbTokens.value()).toByteString()),
        0,
      ) == '1'
    );
  }

  /**
   * Transfers token ownership from the owner's account to
   * the recipient's account using the spender's allowance.
   *
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   *
   * @param {Address} ownerAccount
   * @param {Address} recipientAccount
   * @param {Amount} nbTokens
   *
   * @return {boolean} true on success
   */
  transferFrom(
    ownerAccount: Address,
    recipientAccount: Address,
    nbTokens: Amount,
  ): boolean {
    if (!this.checkAmount(nbTokens)) {
      return false;
    }

    return (
      call(
        this._origin,
        'transferFrom',
        ownerAccount
          .toStringSegment()
          .concat(
            recipientAccount
              .toStringSegment()
              .concat(ByteArray.fromU64(nbTokens.value()).toByteString()),
          ),
        0,
      ) == '1'
    );
  }

  /**
   * A simple function allowing the token owner
   * to mint tokens for an address
   *
   * @param {Address} receiverAccount
   * @param {Amount} nbTokens
   *
   * @return {boolean} true on success
   */
  mint(
    receiverAccount: Address,
    nbTokens: Amount,
  ): boolean {
    if (!this.checkAmount(nbTokens)) {
      return false;
    }

    return (
      call(
        this._origin,
        'mint',
        receiverAccount
          .toStringSegment()
          .concat(ByteArray.fromU64(nbTokens.value()).toByteString()),
        0,
      ) == '1'
    );
  }
}
