import { Args } from '@massalabs/as-types';
import { Address } from '../address';

describe('Address tests', () => {
  it('basic tests', () => {
    const addr = new Address(
      'AU1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    );

    expect(addr.isValid()).toBeTruthy();

    // get address length
    const serializedAddr = addr.serialize();
    // get the fist byte of the serialized address (it is the length of the address)
    const addrLength = serializedAddr[0];
    // get the address string
    const addrString = addr.toString();

    // check if the first character is 'A'
    expect(addrString.charAt(0)).toBe('A');

    // check if the address length is equal to the address string length
    expect(addrLength).toBe(u8(addrString.length));
  });

  it('serializable/de-serialization', () => {
    [
      'AU12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
      'AU1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
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
      'AU12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
      'AU1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    ].forEach((input) => {
      const args = new Args().add(new Address(input));
      const serialized = args.serialize();
      const deserialized = args.nextSerializable<Address>().unwrap();
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
      const deserialized = args.nextSerializable<Address>().unwrap();
      expect(deserialized.toString()).toBe(input);
    });
  });

  it('overloading functions', () => {
    const addr1 = new Address(
      'A12LmTm4zRYkUQZusw7eevvV5ySzSwndJpENQ7EZHcmDbWafx96T',
    );
    const addr2 = new Address(
      'A1aMywGBgBywiL6WcbKR4ugxoBtdP9P3waBVi5e713uvj7F1DJL',
    );

    // check if addr1 == addr1
    expect(addr1 == addr1).toBeTruthy();

    // check if addr1 == addr2
    expect(addr1 == addr2).toBeFalsy();

    // check if addr1 != addr2
    expect(addr1 != addr2).toBeTruthy();
  });
});
