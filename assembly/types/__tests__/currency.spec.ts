import {Currency} from '../currency';

describe('Doc tests', () => {
  it('should be easy to use', () => {
    const c1 = new Currency('Testing', 2);
    expect<string>(c1.name()).toBe('Testing');
    expect<u8>(c1.minorUnit()).toBe(2);

    const c2 = new Currency('Other testing', 2);
    expect<bool>(c1.equals(c2)).toBeFalsy();

    // serialization / deserialization

    // byteArray
    const raw = c1.toByteArray();
    expect<number>(raw.length).toBe(8);
    expect<Currency>(Currency.fromByteArray(raw)).toBe(c1);

    // byteString
    const rawByteString = raw.toByteString();
    expect<number>(rawByteString.length).toBe(8);
    expect<Currency>(Currency.fromByteString(rawByteString)).toBe(c1);

    // stringSegment
    let rawStringSegment = c1.toStringSegment();
    rawStringSegment = rawStringSegment.concat(rawStringSegment);
    expect<number>(rawStringSegment.length).toBe(18);

    const c3 = new Currency();

    const offset = c3.fromStringSegment(rawStringSegment);
    expect<Currency>(c3).toBe(c1);
    expect<number>(offset).toBe(9);

    const c4 = new Currency();
    c4.fromStringSegment(rawStringSegment, offset);
    expect<Currency>(c4).toBe(c1);
  });
});

describe('Black box tests', () => {
  test('empty constructor', () => {
    const c = new Currency();
    expect<string>(c.name()).toBe('');
    expect<u8>(c.minorUnit()).toBe(0);
  });

  test('same currency', () => {
    const c1 = new Currency('aaaa', 6);
    const c2 = new Currency('aaaa', 6);
    expect<bool>(c1.equals(c2)).toBeTruthy();
    expect<bool>(c2.equals(c1)).toBeTruthy();
    expect<bool>(c1.equals(c1)).toBeTruthy();
  });
});
