import { Args } from '@massalabs/as-types';
import { Address } from '../address';

describe('Address tests', () => {
  it('basic tests', () => {
    const a1 = Address.fromString(
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    );

    expect(a1.isValid()).toBeTruthy();

    // serialization / deserialization

    // byteString
    const rawByteString = a1.toString();
    expect<number>(rawByteString.length).toBe(51);
    expect<Address>(Address.fromString(rawByteString)).toBe(a1);
  });

  it('serializable/de-serialization', () => {
    [
      'A12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    ].forEach((input) => {
      const address = new Address(input);
      const serialized = address.serialize();
      const deserialized = new Address();
      deserialized.deserialize(serialized, 0);
      expect(address.toString()).toBe(deserialized.toString());
    });
  });

  it('args', () => {
    [
      'A12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    ].forEach((input) => {
      const args = new Args().add(new Address(input));
      const serialized = args.serialize();
      const deserialized = new Address();
      args.nextSerializable<Address>(deserialized);
      expect(deserialized.toString()).toBe(input);
      expect(serialized).toStrictEqual(deserialized.serialize());
    });
  });

  it('multiple args', () => {
    [
      'A12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    ].forEach((input) => {
      const theNumber = 4;
      const args = new Args()
        .add(theNumber)
        .add(new Address(input))
        .add('example');
      expect(args.nextI32().unwrap()).toBe(theNumber);
      const deserialized = new Address();
      args.nextSerializable<Address>(deserialized);
      expect(deserialized.toString()).toBe(input);
    });
  });
});
