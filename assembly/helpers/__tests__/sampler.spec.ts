import {Sampler} from '../probability/sampler';
import {drawHistogram} from './helper';

const prob = new Map<u64, f64>();
prob.set(0, 0.05);
prob.set(1, 0.1);
prob.set(2, 0.3);
prob.set(3, 0.9);
prob.set(4, 0.07);

/**
 * Changing probability distribution of
 * Sampler class.
 */
class WeightedProbability extends Sampler {
  probability(o: u64): f64 {
    return prob[o];
  }

  // In a real life example you should use only one sampling method.
  drawR(): u64 {
    return this.rejectionSampling(4, 0.9);
  }

  // In a real life example you should use only one sampling method.
  drawI(): u64 {
    return this.inverseCumulativeDistribution(4);
  }
}

describe('Doc test', () => {
  it('should be simple to use rejectionSampling', () => {
    const s = new Sampler();

    // sample is determinist thanks to seed setting
    expect<u64>(s.rejectionSampling(10, 1)).toBe(8);
  });

  it('should be simply extended', () => {
    const d = new WeightedProbability();

    expect<u64>(d.drawR()).toBe(3);
    expect<u64>(d.drawR()).toBe(3);
    expect<u64>(d.drawR()).toBe(2);
    expect<u64>(d.drawR()).toBe(3);
  });

  it('should be simple to extend inverseCumulativeDistribution', () => {
    const d = new WeightedProbability();

    expect<u64>(d.drawI()).toBe(3);
    expect<u64>(d.drawI()).toBe(1);
    expect<u64>(d.drawI()).toBe(3);
    expect<u64>(d.drawI()).toBe(3);
  });
});

describe('Blackbox test', () => {
  // slow
  test('Weighted probability distribution', () => {
    const a = new Uint32Array(5);
    const d = new WeightedProbability();

    for (let i = 0; i < a.length; i++) {
      a[i] = 0;
    }

    for (let i = 0; i < 100000; i++) {
      const s = d.drawI();
      a[u32(s)] += 1;
    }

    drawHistogram(a, 160);
  });
});
