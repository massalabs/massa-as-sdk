/**
 * This module contains all the functions to interact with Massa ASC (Autonomous Smart Contracts)
 */

import { env } from '../env';

/**
 * Get the fees needed to take some space for a new deferred call at a specific slot
 *
 * @param periodTargetSlot - The period of the target slot
 * @param threadTargetSlot - The thread target slot
 * @param maxGas - The maximum amount of gas that the deferred call can use
 *
 * @returns Null if there is enough place otherwise
 * the fees needed to take some space for a new deferred call at a specific slot
 */
export function getDeferredCallFee(
  periodTargetSlot: u64,
  threadTargetSlot: u8,
  maxGas: u64,
): u64 | null {
  const fees = env.deferredCallQuote(
    periodTargetSlot,
    threadTargetSlot,
    maxGas,
  );
  if (fees == 0) {
    return null;
  }
  return fees;
}

/**
 * Register a new deferred call
 *
 * @param targetAddress - The address of the target deferred call
 * @param targetFunction - The function to call in the target deferred call
 * @param targetPeriod - The period of the target slot for the deferred call
 * @param targetThread - The thread of the target slot for the deferred call
 * @param maxGas - The maximum amount of gas that the deferred call can use
 * @param rawCoins - The amount of coins to send to the target deferred call
 * @param params - The parameters to send to the target deferred call function
 *
 * @returns The id of the new deferred call
 */
export function deferredCallRegister(
  targetAddress: string,
  targetFunction: string,
  targetPeriod: u64,
  targetThread: u8,
  maxGas: u64,
  rawCoins: u64,
  params: StaticArray<u8>,
): StaticArray<u8> {
  return env.deferredCallRegister(
    targetAddress,
    targetFunction,
    targetPeriod,
    targetThread,
    maxGas,
    rawCoins,
    params,
  );
}

/**
 * Check if an deferred call exists
 *
 * @param ascCallId - The id of the deferred call
 *
 * @returns True if the deferred call exists otherwise false
 */
export function deferredCallExists(ascCallId: StaticArray<u8>): bool {
  return env.deferredCallExists(ascCallId);
}

/**
 * Cancel an deferred call
 *
 * @param ascCallId - The id of the deferred call
 */
export function deferredCallCancel(ascCallId: StaticArray<u8>): void {
  env.deferredCallCancel(ascCallId);
}
