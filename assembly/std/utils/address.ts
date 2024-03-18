import { env } from '../../env';
import { Address } from '../address';
import { getBytecodeOf } from '../contract';

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

/**
 * Checks if the given address is a user or a contract address.
 *
 * @param address - the string address to identify.
 *
 * @returns 'true' if the address is a user address, 'false' otherwise.
 */
export function isAddressEoa(address: string): bool {
  return env.isAddressEoa(address);
}

/**
 * Returns an array of addresses.
 *
 * Parses a JSON-encoded string of addresses and returns an array of `Address` objects.
 *
 * @remarks
 * This function takes a string containing a JSON-encoded array of addresses
 * (ex: "[address1,address2,...,addressN]") and returns an array of `Address`
 * objects.
 *
 * @param str - A string containing a JSON-encoded array of addresses.
 *
 * @returns An array of `Address` objects, one for each address in the input string.
 */
export function json2Address(str: string): Array<Address> {
  str = str.substring(1, str.length - 1);

  const a = str.split(',');
  return a.map<Address>((x) => new Address(x.substring(1, x.length - 1)));
}

/**
 * Asserts that the given address is an already deployed non-destroyed contract.
 *
 * @param address - The address to check.
 *
 * @throws
 * If the address is not a valid smart contract address.
 * If no bytecode is found at the address.
 */
export function assertIsSmartContract(address: string): void {
  // Check if it's a valid smart contract address
  assert(validateAddress(address), `${address} is not a valid Address`);
  assert(
    address.startsWith('AS'),
    `${address} is not a smart contract Address`,
  );
  // Throw if no contract has been deployed at this address
  const bytecode = getBytecodeOf(new Address(address));
  // Check if the contract has been destroyed
  assert(bytecode.length > 0, `No bytecode found at address: ${address}`);
}
