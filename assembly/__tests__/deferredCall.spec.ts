import {
  deferredCallCancel,
  deferredCallExists,
  deferredCallQuote,
  deferredCallRegister,
  Slot,
} from '../std';

describe('Deferred call test (vm mock)', () => {
  it('exists', () => {
    expect(deferredCallExists('dummy')).toBe(true);
  });

  it('cancel', () => {
    deferredCallCancel('dummy');
  });
  it('quote', () => {
    expect(deferredCallQuote(new Slot(123, 22), 123_456_789)).toBe(123456789);
  });
  it('register', () => {
    expect(
      deferredCallRegister(
        'targetAddress',
        'targetFunction',
        new Slot(123, 22),
        123_456_789,
        [],
        0,
      ),
    ).toBe(
      'D12inbCjPBMwrsMoZbKPyzV3ZAKygPYi3JQ7K7myu5kxQFPvPNBv87FDRjdhs253B95',
    );
  });
});
