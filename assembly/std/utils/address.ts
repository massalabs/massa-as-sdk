import { env } from '../../env';
import { Address } from '../address';

/**
 * Retrieves an 'Address' object from the given public key.
 *
 * @param pubKey - Base58check encoded public key of the address
 *
 * @returns the fetched address as an 'Address' object.
 *
 * @throws
 * - if the public key is invalid
 *
 */
export function publicKeyToAddress(pubKey: string): Address {
  return new Address(env.publicKeyToAddress(pubKey));
}

/**
 * Checks if the given address is valid.
 *
 * @param address - the string address to validate.
 *
 * @returns 'true' if the address is valid, 'false' otherwise.
 *
 */
export function validateAddress(address: string): bool {
  return env.validateAddress(address);
}
