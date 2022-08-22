/**
 * Returns a random number between given limits.
 *
 * Lower and upper limits are possible values.
 *
 * @param {u64} ll - included lower limit.
 * @param {u64} ul - included upper limit.
 * @return {u64}
 */
export function randomInt(ll: u64, ul: u64): u64 {
  return ll + u64(Math.round(f64(ul - ll) * Math.random()));
}
