import { env } from '../../env';

/**
 * Returns the balance of the current address.
 *
 * @returns - value in the smallest unit.
 *
 */
export function balance(): u64 {
  return env.balance();
}

/**
 * Returns the balance of the specified address.
 *
 * @param address - The address for which the balance is retrieved.
 *
 * @returns - value in the smallest unit.
 *
 * @throws
 * - if the given address is not a valid address.
 *
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}
