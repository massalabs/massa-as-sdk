import {Address} from '../address';
import {Args, NoArg} from '../arguments';

const ADDR0 = 'A12cMW9zRKFDS43Z2W88VCmdQFxmHjAo54XvuVV34UzJeXRLXW9M';
const ADDR1 = 'A1nsqw9mCcYLyyMJx5f4in4NXDoe4B1LzV9pQdvX5Wrxq9ehf6h';

describe('Args tests', () => {
  it('With 2 addresses and a number', () => {
    // Create an argument class instance
    const args1 = new Args();
    // add some arguments
    args1
      .add(new Address(ADDR0))
      .add(new Address(ADDR1))
      .add(97 as u64);

    // use serialize to get the byte string
    const byteString = args1.serialize();
    // you can then use it in the call function:
    // env.call(at.toByteString(), functionName, byteString, coins);

    // create an argument class with the byte string
    const args2 = new Args(byteString);
    // assert that the first address is same we provide
    // in the first call to add function
    expect(args2.nextAddress().toByteString()).toBe(ADDR0);
    // and so on with the 2 following arguments
    expect(args2.nextAddress().toByteString()).toBe(ADDR1);
    expect(args2.nextU64()).toBe(97);
  });

  it('With a number and an address', () => {
    const args1 = new Args();
    args1.add(97 as u32).add(new Address(ADDR0));

    expect(args1.nextU32()).toBe(97 as u32);
    expect(args1.nextAddress().toByteString()).toBe(ADDR0);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU32()).toBe(97 as u32);
    expect(args2.nextAddress().toByteString()).toBe(ADDR0);
  });

  it('With Address and i64', () => {
    const args1 = new Args();
    args1
      .add(97 as i64)
      .add(new Address(ADDR0))
      .add(113 as i64);

    expect(args1.nextI64()).toBe(97);
    expect(args1.nextAddress().toByteString()).toBe(ADDR0);
    expect(args1.nextI64()).toBe(113);

    const args2 = new Args(args1.serialize());
    expect(args2.nextI64()).toBe(97);
    expect(args2.nextAddress().toByteString()).toBe(ADDR0);
    expect(args2.nextI64()).toBe(113);
  });

  it('With Address and u64', () => {
    const args1 = new Args();
    args1
      .add(97 as u64)
      .add(new Address(ADDR0))
      .add(113 as u64);

    expect(args1.nextU64()).toBe(97);
    expect(args1.nextAddress().toByteString()).toBe(ADDR0);
    expect(args1.nextU64()).toBe(113);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(97);
    expect(args2.nextAddress().toByteString()).toBe(ADDR0);
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

  it('With a big string', () => {
    const args1 = new Args();
    args1.add('a'.repeat(65600));

    expect(args1.nextString()).toBe('a'.repeat(65600));

    const args2 = new Args(args1.serialize());
    expect(args2.nextString()).toBe('a'.repeat(65600));
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

  it('With u32', () => {
    const args1 = new Args();
    args1.add(97 as u32);

    expect(args1.nextU32()).toBe(97 as u32);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU32()).toBe(97 as u32);
  });

  it('With string and u32', () => {
    const args1 = new Args();
    args1
      .add(97 as u32)
      .add('my string')
      .add(112 as u32);

    expect(args1.nextU32()).toBe(97 as u32);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextU32()).toBe(112 as u32);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU32()).toBe(97 as u32);
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextU32()).toBe(112 as u32);
  });

  it('With string and 0 and max number', () => {
    const args1 = new Args();
    args1
      .add(0 as u64)
      .add('my string')
      .add(u64.MAX_VALUE as u64);

    expect(args1.nextU64()).toBe(0);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextU64()).toBe(u64.MAX_VALUE);

    const args2 = new Args(args1.serialize());
    expect(args2.nextU64()).toBe(0);
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextU64()).toBe(u64.MAX_VALUE);
  });

  it('With no args', () => {
    const args1 = NoArg;
    expect(args1.serialize()).toBe('');
  });

  it('With float numbers', () => {
    const args1 = new Args();
    args1.add(3 as f64);

    expect(args1.nextF64()).toBe(3);

    const args2 = new Args(args1.serialize());
    expect(args2.nextF64()).toBe(3);
  });

  it('With negative numbers and decimal ones', () => {
    const args1 = new Args();
    args1.add(3.4648 as f64);
    args1.add(-2.4783 as f64);
    args1.add(-9 as i64);

    expect(args1.nextF64()).toBe(3.4648);
    expect(args1.nextF64()).toBe(-2.4783);
    expect(args1.nextI64()).toBe(-9);

    const args2 = new Args(args1.serialize());
    expect(args2.nextF64()).toBe(3.4648);
    expect(args2.nextF64()).toBe(-2.4783);
    expect(args2.nextI64()).toBe(-9);
  });

  it('With byteArray', () => {
    const args1 = new Args();
    let test = new Uint8Array(10);
    test[0] = 1;
    test[1] = 2;
    test[2] = 3;
    test[3] = 4;
    test[4] = 5;
    test[5] = 6;
    test[6] = 7;
    test[7] = 8;
    test[8] = 9;
    test[9] = 10;
    args1.add(test);
    expect(args1.nextUint8Array()).toStrictEqual(test);

    const args2 = new Args(args1.serialize());
    expect(args2.nextUint8Array()).toStrictEqual(test);
  });

  it('With byteArray, string and number', () => {
    const args1 = new Args();
    let test = new Uint8Array(10);
    test[0] = 1;
    test[1] = 2;
    test[2] = 3;
    test[3] = 4;
    test[4] = 5;
    test[5] = 6;
    test[6] = 7;
    test[7] = 8;
    test[8] = 9;
    test[9] = 10;
    args1.add('my string');
    args1.add(test);
    args1.add(300 as u64);
    expect(args1.nextString()).toBe('my string');
    expect(args1.nextUint8Array()).toStrictEqual(test);
    expect(args1.nextU64()).toBe(300);

    const args2 = new Args(args1.serialize());
    expect(args2.nextString()).toBe('my string');
    expect(args2.nextUint8Array()).toStrictEqual(test);
    expect(args2.nextU64()).toBe(300);
  });
});
