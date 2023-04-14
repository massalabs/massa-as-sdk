import { env } from '../../env';

/**
 * Generates an unsafe random integer.
 *
 * @remarks
 * This function is unsafe because the random draws are predictable.
 *
 * @returns a random number.
 *
 */
export function unsafeRandom(): i64 {
  return env.unsafeRandom();
}
