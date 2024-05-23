import { KeyIncrementer } from '../keyIncrementer';
import { resetStorage } from '../../vm-mock';

beforeEach(() => {
  resetStorage();
});

describe('KeyIncrementer - unit tests', () => {
  test('nextKey - u8', () => {
    const keyInc = new KeyIncrementer<u8>();
    expect(keyInc.nextKey()).toStrictEqual([0]);
    expect(keyInc.nextKey()).toStrictEqual([1]);
  });

  test('nextKey - u64', () => {
    const keyInc = new KeyIncrementer<u64>();
    expect(keyInc.nextKey()).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(keyInc.nextKey()).toStrictEqual([1, 0, 0, 0, 0, 0, 0, 0]);
  });
});
