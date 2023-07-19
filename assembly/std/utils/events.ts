import { env } from '../../env';
import { encodeLengthPrefixed, stringToUint8Array } from './new_utils';
import * as proto from "massa-proto-as/assembly";

/**
 * Generates an event that is then emitted by the blockchain.
 *
 * @param event - The string event to emit.
 *
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/// NEW
export function generateEventBis(event: string): void {
  const message = stringToUint8Array(event);
  const req = new proto.GenerateEventRequest(message);
  const reqBytes = proto.encodeGenerateEventRequest(req);
  const respBytes = Uint8Array.wrap(
    env.generateEventBis(encodeLengthPrefixed(reqBytes).buffer)
  );

  const resp = proto.decodeAbiResponse(respBytes);

  assert(resp.error === null, "Error generating event" + resp.error!.message);
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
