import { env } from '../../env';

/**
 * Retrieves the current period of the network.
 *
 * @returns the current period.
 *
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Retrieves the current thread of the execution context.
 *
 * @returns the current thread.
 *
 */
export function currentThread(): u8 {
  return env.currentThread();
}
