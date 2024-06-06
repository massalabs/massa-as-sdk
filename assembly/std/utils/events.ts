import { encode } from 'as-base64/assembly';
import { env } from '../../env';
import { staticArrayToUint8Array } from '@massalabs/as-types';

/**
 * Generates an event that is then emitted by the blockchain.
 *
 * @param event - The string event to emit.
 *
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/**
 * Wrap the generateEvent function to emit a raw event.
 *
 * @remarks This function encodes the StaticArray<u8> as a base64 string.
 *
 * Example:
 * ```ts
 * const num: u64 = 8767;
 * const event = new Args().add(num).serialize();
 * generateRawEvent(event);
 * ```
 * @param event - The static array event to emit.
 *
 */
export function generateRawEvent(event: StaticArray<u8>): void {
  generateEvent(encode(staticArrayToUint8Array(event)));
}

/**
 * Constructs a pretty formatted event with given key and arguments.
 *
 * @remarks
 * The result is meant to be used with the {@link generateEvent} function.
 * It is useful to generate events from an array.
 *
 * @param key - the string event key.
 *
 * @param args - the string array arguments.
 *
 * @returns the stringified event.
 *
 */
export function createEvent(key: string, args: Array<string>): string {
  return `${key}:`.concat(args.join(','));
}
