import {
  factorial,
  partialPermutation,
  combination,
} from '../probability/combinatoric';

describe('Blackbox test', () => {
  test('factorial', () => {
    expect<f64>(factorial(5)).toBe(120);
  });
  test('partialPermutation', () => {
    expect<f64>(partialPermutation(4, 3)).toBe(24);
  });
  test('combination', () => {
    expect<f64>(combination(10, 7)).toBe(120);
  });
});
