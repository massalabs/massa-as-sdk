import {randomInt} from './random';

/**
 * Generates samples based on a probability distribution.
 *
 * This class shall be extended with your own probability.
 */
export class Sampler {
  _bounderies: Float64Array;

  /**
   * Instanciates a sampler.
   *
   * This constructor calls seedRandom.
   *
   * @param {u64} s - seed for random Math.random function.
   */
  constructor(s: u64 = 0) {
    Math.seedRandom(s);
    this._bounderies = new Float64Array(0);
  }

  /**
   * Returns the probability of given sample.
   *
   * Probability function doesn't need to be normalized,
   * but the greatest probability of the distribution must be knowned.
   *
   * @param{u64} _ - sample.
   * @return {f64}
   */
  probability(_: u64): f64 {
    return 1;
  }

  /**
   * Generates an observation using the rejection sampling method.
   *
   * This method uses a uniform random function to generate:
   *  - the number k, the potential observation
   *  - the number x, an alea
   *
   *  If the number x is lower or equal to the probability of event k,
   *  then it's an observation.
   *
   *  Otherwise, the process is restarted (k and x are generated).
   *
   *  This process can be describe using the following schema with:
   *   - observations in abscissa (from 0 to 4)
   *   - probability for each observation in ordinate (observation 2 having
   *   the greatest probability p_max)
   *
   *  p_max ────┬─┬────
   *            │ │ ┌─┐
   *          ┌─┤ │ │ │
   *        ┌─┤ │ ├─┤ │
   *        └─┴─┴─┴─┴─┘
   *         0 1 2 3 4
   *
   *  Rejection sampling method for this example do the following:
   *
   *  1- randomly find the potential observation k by using an uniform random
   *     function with lower limit 0 and upper limit 4.
   *     Lets say k = 0.
   *  2- draw a number x, from an unifrom random function with lower limit 0
   *     and upper limit p_max.
   *     Lets say x > p_0. In that case we restart the process from
   *     the begining.
   *  3- randomly find k.
   *     Lets say k = 2.
   *  4- randmly find x.
   *     Lets say x < p_2. In that case the process stop and
   *     the observation is returned.
   *
   *  Graphically, the following process can be represented as the following:
   *
   *   pmax ────┬─┬────
   *            │o│ ┌─┐
   *         x┌─┤ │ │ │
   *        ┌─┤ │ ├─┤ │
   *        └─┴─┴─┴─┴─┘
   *         0 1 2 3 4
   *
   *  Where x represents the failed attempt and o the success one.
   *
   *  Intuitively we "see" the returned observations will match
   *  the underliying probabilities because observations with
   *  greater probability will have a higher chance of being returned
   *  than observation with lower one.
   *
   * @param {u64} n - sampling upper limit
   * @param {f32} max - greatest probability of the distribution
   * @return {u64}
   */
  rejectionSampling(n: u64, max: f32): u64 {
    while (true) {
      const k = randomInt(0, n - 1);
      const x = Math.random() * max;
      if (x <= this.probability(k)) {
        return k;
      }
    }
  }

  /**
   * Populate observation zone bounderies.
   *
   * @param {u64} n - Sampling upper limit
   */
  private populateBounderies(n: u64): void {
    this._bounderies = new Float64Array(i32(n));

    this._bounderies[0];
    this.probability(0);

    for (let i = 1; i < i32(n); i++) {
      this._bounderies[i] = this._bounderies[i - 1] + this.probability(i);
    }
  }

  /**
   * Generates an observation using the inverse cumulative distribution method.
   *
   * This method uses:
   * - the cumulative distribution function to breakdown its from/input set
   *   into observations zone
   * - a uniform random function to generate a number x, that will be used
   *   to identify which observation zone is choosen.
   *
   * The process is the following:
   *
   * 1- The cumulative distribution function is used to define bounderies
   *    of observation zone.
   * 2- An number x is drawn using a uniform distribution function
   * 3- The zone in which the number x falls is the observation
   *
   *  This process can be describe using the following schema with:
   *   - observations in ordinate (from 0 to 4)
   *   - probability for each observation in abscissa
   *
   *  0 ─
   *  1 ──
   *  2 ────
   *  3 ─
   *  4 ───
   *
   * Probabilities are cumulated:
   *
   *  0 ─
   *  1  ──
   *  2    ────
   *  3        ─
   *  4         ───
   *
   * Cumulated probabilities are projected on the same dimension:
   *
   *    ├┼─┼───┼┼──┤
   *    0 1  2 3 4
   *
   * x is drawn and the corresponding observation zone is identified
   * using bounderies:
   *
   *    ├┼x┼───┼┼──┤
   *    0 1  2 3 4
   *
   * @param{u64} n - Sampling upper limit.
   * @return {u64} Observation
   */
  inverseCumulativeDistribution(n: u64): u64 {
    if (this._bounderies.length == 0) {
      this.populateBounderies(n);
    }

    const x = Math.random() * this._bounderies[i32(n - 1)];

    for (let i = 0; i < i32(n); i++) {
      if (x <= this._bounderies[i]) {
        return u64(i);
      }
    }
    return 0;
  }
}
