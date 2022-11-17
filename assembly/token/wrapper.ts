import {Address, call} from '../std/index';
import {Currency, Amount} from '@massalabs/as/assembly';
import {Args} from '../std/arguments';

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
    this._name = call(this._origin, 'name', new Args(), 0);
    this._currency = new Currency(
      this._name,
      U8.parseInt(call(this._origin, 'decimals', new Args(), 0)),
    );
  }

  /**
   * Returns the version of the smart contract.
   * This versioning is following the best practices defined in https://semver.org/.
   *
   * @return {string}
   */
  version(): string {
    return call(this._origin, 'version', new Args(), 0);
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
    return call(this._origin, 'symbol', new Args(), 0);
  }

  /**
   * Returns the total token supply.
   *
   * The number of tokens that were initially minted.
   *
   * @return {Amount} number of minted tokens.
   */
  totalSupply(): Amount {
    return this.toAmount(call(this._origin, 'totalSupply', new Args(), 0));
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
      call(this._origin, 'balanceOf', new Args().add(account), 0),
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
        new Args().add(toAccount).add(nbTokens.value()),
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
        new Args().add(ownerAccount).add(spenderAccount),
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
        new Args().add(spenderAccount).add(nbTokens.value()),
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
        new Args().add(spenderAccount).add(nbTokens.value()),
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
        new Args()
          .add(ownerAccount)
          .add(recipientAccount)
          .add(nbTokens.value()),
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
   * @param {Address} ownerAccount
   * @param {Address} recipientAddress
   * @param {u64} amount
   *
   * @return {boolean} true on success
   */
  delegate(
    ownerAccount: Address,
    recipientAddress: Address,
    amount: u64,
  ): boolean {
    return (
      call(
        this._origin,
        'delegate',
        new Args().add(ownerAccount).add(recipientAddress).add(amount),
        0,
      ) == '1'
    );
  }

  /**
   * Update Voting power of the owner's account to the recipient's
   * account of the amount of tokens.
   *
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} ownerAccount
   * @param {Address} recipientAddress
   * @param {u64} amount
   *
   * @return {boolean} true on success
   */
  updateVotingPower(
    ownerAccount: Address,
    recipientAddress: Address,
    amount: u64,
  ): boolean {
    return (
      call(
        this._origin,
        'updateVotingPower',
        new Args().add(ownerAccount).add(recipientAddress).add(amount),
        0,
      ) == '1'
    );
  }

  /**
   * Castvote for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} proposalId
   * @param {u64} amount
   * @param {string} reason
   *
   * @return {boolean} true on success
   */
  castVote(
    proposalOwner: Address,
    proposalId: string,
    amount: u64,
    reason: string,
  ): boolean {
    return (
      call(
        this._origin,
        'castVote',
        new Args().add(proposalOwner).add(proposalId).add(amount).add(reason),
        0,
      ) == '1'
    );
  }
  /**
   * getProposalData for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} proposalId
   *
   * @return {boolean} true on success
   */
  getProposalData(proposalOwner: Address, proposalId: string): string {
    return call(
      this._origin,
      'getProposalData',
      new Args().add(proposalOwner).add(proposalId),
      0,
    );
  }

  /**
   * getUserVotingData for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} proposalId
   *
   * @return {boolean} true on success
   */
  getUserVotingData(proposalOwner: Address, proposalId: string): string {
    return call(
      this._origin,
      'getUserVotingData',
      new Args().add(proposalOwner).add(proposalId),
      0,
    );
  }
  /**
   * getProposalVotingData for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} proposalId
   *
   * @return {boolean} true on success
   */
  getProposalVotingData(proposalOwner: Address, proposalId: string): string {
    return call(
      this._origin,
      'getProposalVotingData',
      new Args().add(proposalOwner).add(proposalId),
      0,
    );
  }
  /**
   * createProposal for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} title
   * @param {string} description
   * @param {string} tokenName
   * @param {string} tokenSymbol
   * @param {u64} votingDelay
   * @param {u64} votingPeriod
   * @param {u64} treshold
   *
   * @return {boolean} true on success
   */
  createProposal(
    proposalOwner: Address,
    title: string,
    description: string,
    tokenName: string,
    tokenSymbol: string,
    votingDelay: u64,
    votingPeriod: u64,
    treshold: u64,
  ): boolean {
    return (
      call(
        this._origin,
        'createProposal',
        new Args()
          .add(proposalOwner)
          .add(title)
          .add(description)
          .add(tokenName)
          .add(tokenSymbol)
          .add(votingDelay)
          .add(votingPeriod)
          .add(treshold),
        0,
      ) == '1'
    );
  }
  /**
   * EditProposal for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalOwner
   * @param {string} title
   * @param {string} description
   * @param {string} tokenName
   * @param {string} tokenSymbol
   * @param {u64} votingDelay
   * @param {u64} votingPeriod
   * @param {u64} treshold
   *
   * @return {boolean} true on success
   */
  editProposal(
    proposalOwner: Address,
    title: string,
    description: string,
    tokenName: string,
    tokenSymbol: string,
    votingDelay: u64,
    votingPeriod: u64,
    treshold: u64,
  ): boolean {
    return (
      call(
        this._origin,
        'editProposal',
        new Args()
          .add(proposalOwner)
          .add(title)
          .add(description)
          .add(tokenName)
          .add(tokenSymbol)
          .add(votingDelay)
          .add(votingPeriod)
          .add(treshold),
        0,
      ) == '1'
    );
  }
  /**
   * CancelProposal for the caller to a proposal with the given amount of tokens.
   * using reason as the reason for the vote.
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   * @param {Address} proposalId
   *
   * @return {boolean} true on success
   */
  cancelProposal(proposalId: string): boolean {
    return (
      call(this._origin, 'cancelProposal', new Args().add(proposalId), 0) == '1'
    );
  }
}
