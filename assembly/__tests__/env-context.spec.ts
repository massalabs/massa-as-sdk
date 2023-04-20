import { env } from '../env';

describe('Testing env storage functions', () => {
  it('get current period', () => {
    expect(env.currentPeriod()).toBe(0);
  });

  it('get current thread', () => {
    expect(env.currentThread()).toBe(1);
  });
});
