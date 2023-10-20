import { env } from '../../env';

/**
 * Computes the SHA256 hash of the given `data`.
 *
 * @remarks
 * The SHA256 hash algorithm produces a 32-byte hash, which is returned as a `StaticArray<u8>`.
 *
 * @param data - The data to hash.
 *
 * @returns The SHA256 hash of the `data`, serialized as a `StaticArray<u8>`.
 *
 */
export function sha256(data: StaticArray<u8>): StaticArray<u8> {
  return env.sha256(data);
}

/**
 * Converts the given string data into a base58 formatted string.
 *
 * @param data - the string data to convert to base58.
 *
 * @returns the converted data as a string.
 *
 */
export function toBase58(data: string): string {
  ERROR('toBase58 is not implemented yet');
}

/**
 * Checks if a signature is valid.
 *
 * @param publicKey - base58check encoded public key.
 * @param data - The data that was signed.
 * @param signature - base58check encoded signature.
 *
 * @returns 'true' if the signature is valid, 'false' otherwise.
 *
 */
export function isSignatureValid(
  publicKey: string,
  data: string,
  signature: string,
): bool {
  return env.isSignatureValid(data, signature, publicKey);
}

/**
 * Checks if an EVM signature is valid.
 *
 * @param data - The data that was signed.
 * @param signature - Expects a SECP256K1 signature in full ETH format.
 *                    Format: (r, s, v) v will be ignored.
 *                    Length: 65 bytes
 * @param publicKey - Expects a SECP256K1 public key in raw format.
 *                    Length: 64 bytes
 *
 * @returns 'true' if the signature is valid, 'false' otherwise.
 *
 */
export function isEvmSignatureValid(
  data: StaticArray<u8>,
  signature: StaticArray<u8>,
  publicKey: StaticArray<u8>,
): bool {
  return env.isEvmSignatureValid(data, signature, publicKey);
}

/**
 * Get an EVM address from a public key.
 *
 * @param publicKey - Expects a SECP256K1 public key in raw format.
 *                    Length: 64 bytes
 *
 * @returns The EVM address corresponding to the public key, serialized as a `StaticArray<u8>`.
 *
 */
export function evmGetAddressFromPubkey(
  publicKey: StaticArray<u8>,
): StaticArray<u8> {
  return env.evmGetAddressFromPubkey(publicKey);
}

/**
 * Get an EVM public key from a signature.
 *
 * @param hash - Hashed data that was signed.
 * @param signature - Expects a SECP256K1 signature in full ETH format.
 *                    Format: (r, s, v) v will be ignored.
 *                    Length: 65 bytes
 *
 * @returns The EVM public key corresponding to the signature, serialized as a `StaticArray<u8>`.
 */
export function evmGetPubkeyFromSignature(
  hash: StaticArray<u8>,
  signature: StaticArray<u8>,
): StaticArray<u8> {
  return env.evmGetPubkeyFromSignature(hash, signature);
}

/**
 * Computes the Keccak256 hash of the given `data`.
 *
 * @param data - The data to hash.
 *
 * @returns The Keccak256 hash of the `data`, serialized as a `StaticArray<u8>`.
 *
 */
export function keccak256(data: StaticArray<u8>): StaticArray<u8> {
  return env.keccak256(data);
}
