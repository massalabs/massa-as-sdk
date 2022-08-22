/**
 * Returns the number of unordered subsets of k elements
 * taken from a set of n elements.
 *
 * @param{u64} n - Number of elements in set.
 * @param{u64} k - Number of elements in subset.
 * @return {u64}
 */
export function combination(n: u64, k: u64): f64 {
  return partialPermutation(n, k) / factorial(k);
}

/**
 * Returns the number of ordered subsets of k elements
 * taken from a set of n elements.
 *
 * @param{u64} n - Number of elements in set.
 * @param{u64} k - Number of elements in subset.
 * @return {f64}
 */
export function partialPermutation(n: u64, k: u64): f64 {
  return factorial(n) / factorial(n - k);
}

/**
 * Returns the number of permutation of n elements.
 *
 * @param {u64} n - Number of elements.
 *
 * @return {f64}
 */
export function factorial(n: u64): f64 {
  let r: f64 = 1;
  const l = f64(n);

  for (let i: f64 = 2; i <= l; i++) {
    r *= i;
  }
  return r;
}
