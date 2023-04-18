import { env } from '../../env';

/**
 * Logs a string message in the massa-node logs.
 *
 * @param message - The string message to be logged in the node.
 *
 */
export function print(message: string): void {
  env.print(message);
}
