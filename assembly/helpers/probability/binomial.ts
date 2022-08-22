import {combination} from './combinatoric';
import {Sampler} from './sampler';

export interface Drawer {
  draw(): u64;
}

/**
 * Binomial distribution
 *
 */
export class Binomial extends Sampler implements Drawer {
  _n: u64; // Number of independent experiments.
  _p: f32; // Success probability of each experiment.
  _m: f32; // Maximal probability value returned by mass probability function.

  /**
   * Instanciates a binomial distribution.
   *
   * @param {u64} n - Number of independent experiments.
   * @param {f32} p - Probability of success of each experiment.
   */
  constructor(n: u64, p: f32) {
    super();
    this._n = n;
    this._p = p;
  }

  /**
   * Returns the propability of event.
   *
   * The mass probability function is used to compute the probability of
   * event k.
   *
   * @param {u64} k - Event.
   * @return {f64}
   */
  probability(k: u64): f64 {
    return (
      combination(this._n, k) *
      Math.pow(this._p, f64(k)) *
      Math.pow(1 - this._p, f64(this._n - k))
    );
  }

  /**
   * Draws a number.
   *
   * Rejection sampling method is used to generates an observation
   * from binomial distribution.
   *
   * @return {u64}
   */
  draw(): u64 {
    if (this._m == 0) {
      if (this._n % 2 == 1) {
        this._m = f32(this.probability((this._n - 1) / 2));
      } else {
        this._m = f32(this.probability(this._n / 2));
      }
    }

    return this.rejectionSampling(this._n, this._m);
  }
}
