import {Address} from '../address';
import {Args} from '../arguments';

const ADDR0 = 'A12cap3Gd1bDwVaY7LkPAj7GAayKueNq6ebaPELBfBhQLqR3R7rg';
const ADDR1 = 'A1Czd9sRp3mt2KU9QBEEZPsYxRq9TisMs1KnV4JYCe7Z4AAVinq';

describe('Args tests', () => {
  it('With 2 addresses and a number', () => {
    const args1 = new Args();
    args1.add(new Address(ADDR0)).add(new Address(ADDR1)).add(97);

    const args2 = new Args(args1.serialize());
    expect(args2.nextAddress()._value).toBe(ADDR0);
    expect(args2.nextAddress()._value).toBe(ADDR1);
    expect(args2.nextU64()).toBe(97);
  });

  it('With a number and an address', () => {
    const args1 = new Args();
    args1.add(97).add(new Address(ADDR0));

    expect(args1.nextU64()).toBe(97);
    expect(args1.nextAddress()._value).toBe(ADDR0);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(97);
    expect(args2.nextAddress()._value).toBe(ADDR0);
  });

  it('With Address and i64', () => {
    const args1 = new Args();
    args1
      .add(97 as i64)
      .add(new Address(ADDR0))
      .add(113 as i64);

    expect(args1.nextI64()).toBe(97);
    expect(args1.nextAddress()._value).toBe(ADDR0);
    expect(args1.nextI64()).toBe(113);

    const args2 = new Args(args1.serialize());
    expect(args2.nextI64()).toBe(97);
    expect(args2.nextAddress()._value).toBe(ADDR0);
    expect(args2.nextI64()).toBe(113);
  });

  it('With Address and u64', () => {
    const args1 = new Args();
    args1
      .add(97 as u64)
      .add(new Address(ADDR0))
      .add(113 as u64);

    expect(args1.nextU64()).toBe(97);
    expect(args1.nextAddress()._value).toBe(ADDR0);
    expect(args1.nextU64()).toBe(113);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(97);
    expect(args2.nextAddress()._value).toBe(ADDR0);
    expect(args2.nextU64()).toBe(113);
  });

  it('With string and i64', () => {
    const args1 = new Args();
    args1
      .add(97 as i64)
      .add('my string')
      .add(113 as i64);

    expect(args1.nextI64()).toBe(97);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextI64()).toBe(113);

    const args2 = new Args(args1.serialize());
    expect(args2.nextI64()).toBe(97);
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextI64()).toBe(113);
  });

  it('With string and u64', () => {
    const args1 = new Args();
    args1
      .add(97 as u64)
      .add('my string')
      .add(11356323656733 as u64);

    expect(args1.nextU64()).toBe(97);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextU64()).toBe(11356323656733);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(97);
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextU64()).toBe(11356323656733);
  });

  it('With string and 0 and max number', () => {
    const args1 = new Args();
    args1
      .add(0 as u64)
      .add('my string')
      .add(0xffffffffffffffff as u64);

    expect(args1.nextU64()).toBe(0);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextU64()).toBe(0xffffffffffffffff);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(0);
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextU64()).toBe(0xffffffffffffffff);
  });
});
