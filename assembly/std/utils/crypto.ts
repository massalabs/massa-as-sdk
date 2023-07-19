import { env } from '../../env';
import { encodeLengthPrefixed } from './new_utils';
import * as proto from "massa-proto-as/assembly";

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
 * @param digest - digest message.
 * @param signature - base58check encoded signature.
 *
 * @returns 'true' if the signature is valid, 'false' otherwise.
 *
 */
export function isSignatureValid(
  publicKey: string,
  digest: string,
  signature: string,
): bool {
  return env.isSignatureValid(digest, signature, publicKey);
}

/**
 * Checks if an EVM signature is valid.
 *
 * @param digest - Digest message.
 * @param publicKey - Expects a public key in ETH full format.
 *                    Length: 65 bytes
 * @param signature - Expects a SECP256K1 signature in full ETH format.
 *                    Format: (r, s, v) v will be ignored.
 *                    Length: 65 bytes
 *
 * @returns 'true' if the signature is valid, 'false' otherwise.
 *
 */
export function isEvmSignatureValid(
  digest: StaticArray<u8>,
  signature: StaticArray<u8>,
  publicKey: StaticArray<u8>,
): bool {
  return env.isEvmSignatureValid(digest, signature, publicKey);
}

/// NEW
export function isEvmSignatureValidBis(
  digest: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): bool {
  const req = new proto.VerifyEvmSigRequest(digest, signature, publicKey);
  const reqBytes = proto.encodeVerifyEvmSigRequest(req);
  const respBytes = Uint8Array.wrap(
    env.isEvmSignatureValidBis(encodeLengthPrefixed(reqBytes).buffer)
  );
  const resp = proto.decodeAbiResponse(respBytes);
  assert(resp.error === null);
  assert(resp.res !== null);
  assert(resp.res!.verifyEvmSigResult !== null);
  return resp.res!.verifyEvmSigResult!.isVerified;
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
