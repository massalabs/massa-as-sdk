/**
 * This module contains all the functions to interact with Massa deferred call (Garanted Autonomous Smart Contracts)
 */

import { env } from '../env';
import { Slot } from './context';

/**
 * Get the price of booking a deferred call in a given slot.
 *
 * @param targetSlot - The targeted slot
 * @param maxGas - The maximum amount of gas that the deferred call can use
 *
 * @returns Mas amount
 *
 */
export function deferredCallQuote(targetSlot: Slot, maxGas: u64): u64 {
  return env.deferredCallQuote(targetSlot.period, targetSlot.thread, maxGas);
}

/**
 * Register a new deferred call
 *
 * @param targetAddress - The address of the target deferred call
 * @param targetFunction - The function to call in the target deferred call
 * @param targetSlot - The target slot for the deferred call
 * @param maxGas - The maximum amount of gas that the deferred call can use
 * @param params - The parameters to send to the target deferred call function
 * @param rawCoins - The amount of coins to send to the target deferred call
 *
 * @returns The id of the new deferred call
 */
export function deferredCallRegister(
  targetAddress: string,
  targetFunction: string,
  targetSlot: Slot,
  maxGas: u64,
  params: StaticArray<u8>,
  rawCoins: u64,
): string {
  return env.deferredCallRegister(
    targetAddress,
    targetFunction,
    targetSlot.period,
    targetSlot.thread,
    maxGas,
    params,
    rawCoins,
  );
}

/**
 * Check if an deferred call exists
 *
 * @param ascCallId - The id of the deferred call
 *
 * @returns True if the deferred call exists otherwise false
 */
export function deferredCallExists(ascCallId: string): bool {
  return env.deferredCallExists(ascCallId);
}

/**
 * Cancel an deferred call
 *
 * @param ascCallId - The id of the deferred call
 *
 * @returns True if the deferred call has been canceled otherwise false
 */
export function deferredCallCancel(ascCallId: string): void {
  env.deferredCallCancel(ascCallId);
}

/**
 * Find the cheapest slot within a given period range.
 *
 * @param startPeriod - The start period of the range to check
 * @param endPeriod - The end period of the range to check
 * @param maxGas - The maximum amount of gas that the deferred call can use
 *
 * @returns An object containing the period and thread of the cheapest slot
 */
export function findCheapestSlot(
  startPeriod: u64,
  endPeriod: u64,
  maxGas: u64,
): Slot {
  let cheapestSlotPeriod: u64 = startPeriod;
  let cheapestSlotThread: u8 = 0;
  let cheapestSlotPrice: u64 = U64.MAX_VALUE;

  for (let period = startPeriod; period <= endPeriod; period++) {
    for (let thread: u8 = 0; thread < 32; thread++) {
      const price = deferredCallQuote(new Slot(period, thread), maxGas);
      if (price < cheapestSlotPrice) {
        cheapestSlotPrice = price;
        cheapestSlotPeriod = period;
        cheapestSlotThread = thread;
      }
    }
  }

  return new Slot(cheapestSlotPeriod, cheapestSlotThread);
}
