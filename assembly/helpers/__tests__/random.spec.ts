import {randomInt} from '../probability/random';
import {drawHistogram} from './helper';

describe('Doc test', () => {
  it('should be simple to use', () => {
    const lowerLimit = 0;
    const upperLimit = 5;

    for (let i = 0; i < 5; i++) {
      const s = randomInt(lowerLimit, upperLimit);

      expect<u64>(s).toBeGreaterThanOrEqual(0);
      expect<u64>(s).toBeLessThanOrEqual(5);
    }
  });
});

describe('Blackbox test', () => {
  test('uniform distribution', () => {
    const a = new Uint32Array(41);

    for (let i = 0; i < a.length; i++) {
      a[i] = 0;
    }

    for (let i = 0; i < 1000000; i++) {
      a[i32(randomInt(0, 40))] += 1;
    }

    drawHistogram(a, 160);
  });
});
