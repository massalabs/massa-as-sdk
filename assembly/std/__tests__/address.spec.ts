import { Address } from '../address';

describe('Address tests', () => {
  it('basic tests', () => {
    const a1 = Address.fromByteString(
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    );

    expect<bool>(a1.isValid()).toBeTruthy();

    // serialization / deserialization

    // byteArray
    const rawByteArray = a1.toByteArray();
    expect<number>(rawByteArray.length).toBe(51);
    expect<Address>(Address.fromByteArray(rawByteArray)).toBe(a1);

    // byteString
    const rawByteString = rawByteArray.toByteString();
    expect<number>(rawByteString.length).toBe(51);
    expect<Address>(Address.fromByteString(rawByteString)).toBe(a1);

    // stringSegment
    let rawStringSegment = a1.toStringSegment();
    rawStringSegment = rawStringSegment.concat(rawStringSegment);
    expect<number>(rawStringSegment.length).toBe(104);

    const a2 = new Address('');
    const offset = a2.fromStringSegment(rawStringSegment);
    expect<Address>(a2).toBe(a1);
    expect<number>(offset).toBe(52);

    const a3 = new Address('');
    a3.fromStringSegment(rawStringSegment, offset);
    expect<Address>(a3).toBe(a1);
  });
});
