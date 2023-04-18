import { env } from '../../env';

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
