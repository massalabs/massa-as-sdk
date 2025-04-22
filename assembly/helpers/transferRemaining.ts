import { SafeMath } from '@massalabs/as-types';
import { Address, balance, Context, transferCoins } from '../std';

/**
 * Function to transfer remaining Massa coins to a recipient at the end of a call
 * @param balanceInit - Initial balance of the SC (transferred coins + balance of the SC)
 * @param callerDebit - The amount of coins that the caller is expected to pay to the SC
 */
export function transferRemaining(
  balanceInit: u64,
  callerDebit: u64 = 0,
  refundRecipient: Address = Context.caller(),
): void {
  // Get the current balance of the smart contract
  const balanceFinal = balance();
  // Get the coins transferred to the smart contract
  const sent = Context.transferredCoins();

  assert(sent >= callerDebit, 'INSUFFICIENT_COINS_TRANSFERRED');

  if (balanceInit >= balanceFinal) {
    // Some operation might spend Massa by creating new storage space
    const spent = SafeMath.sub(balanceInit, balanceFinal);
    const totalToSpend = SafeMath.add(spent, callerDebit);
    assert(totalToSpend <= sent, 'SPENT_MORE_COINS_THAN_SENT');
    if (totalToSpend < sent) {
      // SafeMath not needed as totalToSpend is always less than sent
      const remaining: u64 = sent - totalToSpend;
      transferCoins(refundRecipient, remaining);
    }
  } else {
    // Some operation might unlock Massa by deleting storage space
    const received = SafeMath.sub(balanceFinal, balanceInit);
    // SafeMath not needed as callerDebit is always less or equal than sent
    const totalToSpend = sent - callerDebit;
    const totalToSend: u64 = SafeMath.add(totalToSpend, received);
    transferCoins(refundRecipient, totalToSend);
  }
}
