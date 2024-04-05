import { fromBytes, toBytes } from '@massalabs/as-types';
import { Address, Storage } from '../std';

// to move in it's dedicated file
export class StoragePrefixManager {
  private prefix: u8 = 0;
  newPrefix(): u8 {
    return this.prefix++;
  }
}

// Key used to store the total supply in storage.
const totalSupplyKey: u8 = 0x00;

/**
 * Manages liquidity for tokens, with generic flexibility.
 *
 * @remarks
 * It does not implement overflow and underflow checks for operations.
 *
 * @typeParam T - The type used for liquidity amount.
 *
 * @privateRemarks
 * Balance and allowance are stored separately in storage using distinct prefixes.
 * Total supply is stored under a fixed key.
 */
export class LiquidityManager<T> {
  private balancePrefix: u8;
  private allowancePrefix: u8;

  constructor(storagePrefixManager: StoragePrefixManager) {
    this.balancePrefix = storagePrefixManager.newPrefix();
    this.allowancePrefix = storagePrefixManager.newPrefix();
  }

  @inline
  private _getOrNull(key: StaticArray<u8>): T {
    return Storage.has(key) ? <T>fromBytes<T>(Storage.get(key)) : <T>0;
  }

  @inline
  private _free(key: StaticArray<u8>): void {
    if (Storage.has(key)) {
      assert(
        fromBytes<T>(Storage.get(key)) == <T>0,
        `Storage value is not null ${fromBytes<T>(Storage.get(key))}`,
      );
      Storage.del(key);
    }
  }

  @inline
  private _getTotalSupplyKey(): StaticArray<u8> {
    return [this.balancePrefix, totalSupplyKey];
  }

  /**
   * Fetches the total supply of the token.
   *
   * @remarks
   * By default, the total supply is 0.
   *
   * @returns The total token supply.
   */
  public getTotalSupply(): T {
    return this._getOrNull(this._getTotalSupplyKey());
  }

  @inline
  private _getBalanceStorageKey(user: Address): StaticArray<u8> {
    const key = new StaticArray<u8>(1);
    key[0] = this.balancePrefix;
    return key.concat(user.serialize());
  }

  private _updateAmount(key: StaticArray<u8>, amount: T, increase: bool): void {
    var newAmount = this._getOrNull(key);
    if (increase) {
      // @ts-ignore arithmetic operations on generic types
      newAmount += amount;
    } else {
      // @ts-ignore arithmetic operations on generic types
      newAmount -= amount;
    }
    Storage.set(key, toBytes(newAmount));
  }

  /**
   * Retrieves the balance for a specified user address.
   *
   * @param user - The user's address.
   *
   * @returns User's balance, or 0 if no balance is found.
   */
  public getBalance(user: Address): T {
    return this._getOrNull(this._getBalanceStorageKey(user));
  }

  /**
   * Eliminates a user's balance from the storage. No action if the balance doesn't exist.
   *
   * @param user - The user's address.
   *
   * @throws if the user has a non-zero balance.
   */
  public removeBalance(user: Address): void {
    this._free(this._getBalanceStorageKey(user));
  }

  /**
   * Transfers an amount of liquidity from one user to another.
   *
   * @remarks
   * If the receiver has no balance in the storage, a new one is created.
   *
   * @param from - Sender's address.
   * @param to - Receiver's address.
   * @param amount - Amount of liquidity to transfer.
   *
   * @throws if the sender's balance is insufficient.
   */
  public transfer(from: Address, to: Address, amount: T): void {
    const fromKey = this._getBalanceStorageKey(from);
    const fromBalance = this._getOrNull(fromKey);
    assert(fromBalance >= amount, 'Not enough balance to transfer');
    this._updateAmount(fromKey, amount, false);

    const toKey = this._getBalanceStorageKey(to);
    this._updateAmount(toKey, amount, true);
  }

  /**
   * Mints liquidity to a user's balance and updates the total supply.
   *
   * @remarks
   * If the receiver has no balance in the storage, a new one is created.
   * mint also updates the total supply of the token.
   *
   * @param user - The user's address.
   * @param amount - Amount to mint.
   */
  public mint(user: Address, amount: T): void {
    const userBalance = this._getBalanceStorageKey(user);
    this._updateAmount(userBalance, amount, true);
    this._updateAmount(this._getTotalSupplyKey(), amount, true);
  }

  /**
   * Burns liquidity from a user's balance and updates the total supply.
   *
   * @param user - The user's address.
   * @param amount - Amount to burn.
   *
   * @throws if the user's balance is insufficient.
   */
  public burn(user: Address, amount: T): void {
    const userBalanceKey = this._getBalanceStorageKey(user);
    assert(
      this._getOrNull(userBalanceKey) >= amount,
      'Not enough balance to burn',
    );

    this._updateAmount(userBalanceKey, amount, false);
    this._updateAmount(this._getTotalSupplyKey(), amount, false);
  }

  @inline
  private _getAllowanceStorageKey(user: Address): StaticArray<u8> {
    const key = new StaticArray<u8>(1);
    key[0] = this.allowancePrefix;
    return key.concat(user.serialize());
  }

  /**
   * Fetches the allowed amount a spender can use from an owner's funds.
   *
   * @remarks
   * If the spender has no allowance in the storage, 0 is returned.
   *
   * @param owner - Owner's address.
   * @param spender - Spender's address.
   * @returns The spender's allowance, or 0 if none is found.
   */
  public getAllowance(owner: Address, spender: Address): T {
    return this._getOrNull(
      this._getAllowanceStorageKey(owner).concat(spender.serialize()),
    );
  }

  /**
   * Removes the allowance of a spender to use the liquidity of an owner from the storage.
   *
   * @remarks
   * If the spender has no allowance in the storage, the function does nothing.
   *
   * @param owner - The address of the owner.
   * @param spender - The address of the spender.
   *
   * @throws if the spender has a non-null allowance.
   */
  public removeAllowance(owner: Address, spender: Address): void {
    this._free(this._getAllowanceStorageKey(owner).concat(spender.serialize()));
  }

  /**
   * Updates the allowance set for a spender by an owner.
   *
   * @remarks
   * If the spender has no allowance in the storage, a new allowance is created.
   *
   * @param owner - Owner's address.
   * @param spender - Spender's address.
   * @param deltaAmount - Amount to adjust the allowance by.
   * @param increase - Whether to increase (true) or decrease (false) the allowance.
   *
   * @throws if attempting to decrease allowance below available amount.
   */
  public updateAllowance(
    owner: Address,
    spender: Address,
    deltaAmount: T,
    increase: bool,
  ): void {
    const key = this._getAllowanceStorageKey(owner).concat(spender.serialize());
    if (!increase) {
      assert(
        this._getOrNull(key) >= deltaAmount,
        'Not enough allowance to decrease',
      );
    }

    this._updateAmount(key, deltaAmount, increase);
  }

  private _useAllowance(owner: Address, spender: Address, amount: T): void {
    const key = this._getAllowanceStorageKey(owner).concat(spender.serialize());
    assert(this._getOrNull(key) >= amount, 'Not enough allowance to use');
    this._updateAmount(key, amount, false);
  }

  /**
   * Transfers liquidity using the allowance mechanism.
   *
   * @param owner - Owner's address.
   * @param spender - Spender's address.
   * @param to - Receiver's address.
   * @param amount - Amount of liquidity to transfer.
   *
   * @throws if the spender's allowance is insufficient.
   */
  public transferFrom(
    owner: Address,
    spender: Address,
    to: Address,
    amount: T,
  ): void {
    this._useAllowance(owner, spender, amount);

    this.transfer(owner, to, amount);
  }

  /**
   * Burns liquidity from an owner using the allowance mechanism.
   *
   * @param owner - Owner's address.
   * @param spender - Spender's address.
   * @param amount - Amount of liquidity to burn.
   *
   * @throws if the spender's allowance is insufficient.
   */
  public burnFrom(owner: Address, spender: Address, amount: T): void {
    this._useAllowance(owner, spender, amount);

    this.burn(owner, amount);
  }
}
