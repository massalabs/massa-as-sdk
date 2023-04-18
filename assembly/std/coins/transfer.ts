import { env } from '../../env';
import { Address } from '../address';

/**
 * Transfers coins from the current address 'to' a given address.
 *
 * @param to - the address to send coins to.
 * @param amount - value in the smallest unit.
 * @see [massa units standard](https://github.com/massalabs/massa-standards/blob/main/units.md)
 *
 * @throws
 * - if the given address is not a valid address.
 * - if the balance of the current address is insufficient to make the transaction.
 *
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toString(), amount);
}

/**
 * Transfers coins 'from' an address 'to' another address.
 *
 * @remarks
 * The transfer can only be done if the caller has write access to the sender's address.
 * @see {@link callerHasWriteAccess}
 *
 * @param from - the sender address.
 * @param to - the address to send coins to.
 * @param amount - value in the smallest unit.
 * @see [massa units standard](https://github.com/massalabs/massa-standards/blob/main/units.md)
 *
 * @throws
 * - if the sender's or the receiver address is not a valid address.
 * - if the balance of the sender's address is insufficient to make the transaction.
 *
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toString(), to.toString(), amount);
}
