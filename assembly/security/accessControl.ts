import { fromBytes, toBytes } from '@massalabs/as-types';
import { Address, Storage } from '../std/index';

/**
 * Represents a role-based access control object.
 *
 * @remarks
 * Manages roles and permissions using a bitmask approach. Each bit in a bitmask represents a distinct permission.
 *
 * @typeParam T - Use to size the bitmask. The maximum number of permissions is 8 * sizeof<T>().
 *
 * @privateRemarks
 * - Permissions are encoded as bits in a bitmask for compact storage and easy manipulation.
 * - User access rights are stored and managed in a similar bitmask format.
 * - Utilizes blockchain's native storage, with ModuleId as a prefix to differentiate keys
 *   belonging to different modules.
 *
 * @example
 * ```ts
 * import { Context, Address } from '@massalabs/massa-as-sdk';
 * import { Args, stringToBytes } from '@massalabs/as-types';
 * import { AccessControl } from '@massalabs/sc-standards';
 *
 * const controller = new AccessControl<u8>(1);
 * const ADMIN = controller.newPermission('admin');
 * const USER = controller.newPermission('user');
 *
 * export function constructor(raw: StaticArray<u8>): StaticArray<u8> {
 *   if (!Context.isDeployingContract()) {
 *     return [];
 *   }
 *
 *   const args = new Args(raw);
 *   const adminAddress = args.nextSerializable<Address>().expect('Admin address is missing');
 *   const userAddress = args.nextSerializable<Address>().expect('User address is missing');
 *
 *   controller.grantPermission(ADMIN, adminAddress);
 *   controller.grantPermission(USER, userAddress);
 *
 *   return [];
 * }
 *
 * export function superSensite(_: StaticArray<u8>): StaticArray<u8> {
 *   controller.mustHavePermission(ADMIN, Context.caller());
 *   return stringToBytes('Super sensitive data');
 * }
 *
 * export function internalOnly(_: StaticArray<u8>): StaticArray<u8> {
 *   controller.mustHaveAnyPermission(ADMIN | USER, Context.caller());
 *   return stringToBytes('Internal data');
 * }
 *
 * export function publicData(_: StaticArray<u8>): StaticArray<u8> {
 *   return stringToBytes('Public data');
 * }
 * ```
 */
export class AccessControl<T> {
  // @ts-ignore non-number type
  private permissionIndex: u8 = 0;
  private permissionsName: string[] = [];
  private moduleId: u8;
  private errPermissionDoesNotExist: string = 'Permission does not exist.';

  /**
   *
   * @param moduleId - The module identifier to differentiate storage keys.
   */
  constructor(moduleId: u8) {
    this.moduleId = moduleId;
  }

  @inline
  private _getStorageKey(userAddress: Address): StaticArray<u8> {
    const key = new StaticArray<u8>(1);
    key[0] = this.moduleId;
    return key.concat(userAddress.serialize());
  }

  @inline
  private _getUserAccess(user: Address): T {
    const key = this._getStorageKey(user);
    return Storage.has(key) ? <T>fromBytes<T>(Storage.get(key)) : <T>0;
  }

  @inline
  private _setUserAccess(user: Address, access: T): void {
    const key = this._getStorageKey(user);
    Storage.set(key, toBytes(access));
  }

  @inline
  private _permissionIndexToBitmask(index: u8): T {
    return <T>(1 << index);
  }

  @inline
  private _permissionToName(permission: T): string {
    // @ts-ignore arithmetic operations on generic types
    return this.permissionsName[permission >> 1];
  }

  /**
   * Creates a new permission.
   *
   * @remarks
   * Permissions are dynamically created and not stored in the contract's storage.
   * While this optimization reduces storage usage, it also means that the permission
   * must be globally defined and consistent.
   *
   * @param Permission - The name of the permission.
   * @returns a number representing the permission.
   *
   * @throws if the maximum number of permissions is reached.
   */
  public newPermission(Permission: string): T {
    assert(
      this.permissionIndex < sizeof<T>() * 8,
      `Maximum number of permissions reached.`,
    );
    this.permissionsName.push(Permission);
    this.permissionIndex += 1;
    return this._permissionIndexToBitmask(this.permissionIndex - 1);
  }

  /**
   * Add a permission to a user.
   *
   * @remarks
   * Updated permissions are stored in the contract's storage.
   *
   * @param permission - The permission to grant.
   * @param user - The user identified by his address.
   *
   * @throws if the user already has the permission or if the permission does not exist.
   */
  public grantPermission(permission: T, user: Address): void {
    assert(
      permission < this._permissionIndexToBitmask(this.permissionIndex),
      this.errPermissionDoesNotExist,
    );

    const ua = this._getUserAccess(user);

    assert(
      // @ts-ignore arithmetic operations on generic types
      (ua & permission) != permission,
      `User already has '${this._permissionToName(permission)}' permission.`,
    );
    // @ts-ignore arithmetic operations on generic types
    this._setUserAccess(user, ua | permission);
  }

  /**
   * Removes a permission from a user.
   *
   * @remarks
   * Updated permissions are stored in the contract's storage.
   *
   * @param permission - The permission to remove.
   * @param user - The user identified by his address.
   *
   * @throws if the user does not have the permission or if the permission does not exist.
   */
  public revokePermission(permission: T, user: Address): void {
    assert(
      permission < this._permissionIndexToBitmask(this.permissionIndex),
      this.errPermissionDoesNotExist,
    );

    const ua = this._getUserAccess(user);

    assert(
      // @ts-ignore arithmetic operations on generic types
      (ua & permission) == permission,
      `User does not have '${this._permissionToName(permission)}' permission.`,
    );
    // @ts-ignore arithmetic operations on generic types
    this._setUserAccess(user, ua & ~permission);
  }

  /**
   * Checks if the user has the given permission.
   *
   * @param permission - The permission bitmask to check.
   * @param user - The user identified by his address.
   * @returns true if the user has the permission, false otherwise.
   *
   * @throws if the permission does not exist.
   */
  public hasPermission(permission: T, user: Address): boolean {
    assert(
      permission < this._permissionIndexToBitmask(this.permissionIndex),
      this.errPermissionDoesNotExist,
    );

    const ua = this._getUserAccess(user);
    // @ts-ignore arithmetic operations on generic types
    return (ua & permission) == permission;
  }

  /**
   * Checks if the user has the given permission.
   *
   * @param permission - The permission bitmask to check.
   * @param user - The user identified by his address.
   *
   * @throws if the user does not have the permission.
   */
  @inline
  public mustHavePermission(permission: T, user: Address): void {
    assert(
      this.hasPermission(permission, user),
      `User does not have '${this._permissionToName(permission)}' permission.`,
    );
  }

  /**
   * Checks if the user has any of the given permissions.
   * @param permission - The permission bitmask to check.
   * @param user - The user identified by his address.
   * @returns true if the user has any of the permissions, false otherwise.
   *
   * @throws if the permission does not exist.
   */
  public hasAnyPermission(permission: T, user: Address): boolean {
    assert(
      permission < this._permissionIndexToBitmask(this.permissionIndex),
      this.errPermissionDoesNotExist,
    );

    const ua = this._getUserAccess(user);
    // @ts-ignore arithmetic operations on generic types
    return (ua & permission) != 0;
  }

  /**
   * Checks if the user has any of the given permissions.
   * @param permission - The permission bitmask to check.
   * @param user - The user identified by his address.
   *
   * @throws if the user does not have any of the permissions.
   */
  @inline
  public mustHaveAnyPermission(permission: T, user: Address): void {
    assert(
      this.hasAnyPermission(permission, user),
      `User does not have any of the permissions.`,
    );
  }
}
