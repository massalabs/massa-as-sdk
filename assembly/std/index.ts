import { env } from '../env/index';
import { Address } from './address';
import * as Storage from './storage';
import * as Context from './context';
import { Args } from '@massalabs/as-types';

export { Address, Storage, Context };

/**
 * Prints in the node logs
 *
 * @param message - Message string
 */
export function print(message: string): void {
  env.print(message);
}

/**
 * Calls a remote function located at the given address with the specified arguments and returns its return value.
 *
 * @param at - The address of the contract containing the remote function to call.
 * @param functionName - The name of the remote function to call.
 * @param args - The arguments to pass to the remote function.
 * @param coins - The amount of coins to send along with the function call.
 *
 * @returns The return value of the remote function.
 *
 * @throws
 * - Throws an error if the remote function call fails.
 * - Throws an error if the address doesn't exist.
 *
 */
export function call(
  at: Address,
  functionName: string,
  args: Args,
  coins: u64,
): StaticArray<u8> {
  return env.call(at.toString(), functionName, args.serialize(), coins);
}

/**
 * Calls a remote function located at the given address within the current context.
 *
 * @param at - The address of the contract containing the remote function to call.
 * @param functionName - The name of the remote function to call.
 * @param args - The arguments to pass to the remote function.
 *
 * @returns The return value of the remote function.
 *
 * @throws
 * - Throws an error if the remote function call fails.
 * - Throws an error if the address doesn't exist.
 */
export function localCall(
  at: Address,
  functionName: string,
  args: Args,
): StaticArray<u8> {
  return env.localCall(at.toString(), functionName, args.serialize());
}

/**
 * Executes a given bytecode within the current context and returns its return value.
 *
 * @param bytecode - The bytecode to execute.
 * @param functionName - The name of the function to call within the bytecode.
 * @param args - The arguments to pass to the function within the bytecode.
 *
 * @returns The return value of the function within the bytecode.
 *
 * @throws Throws an error if the execution of the bytecode fails.
 */
export function localExecution(
  bytecode: StaticArray<u8>,
  functionName: string,
  args: Args,
): StaticArray<u8> {
  return env.localExecution(bytecode, functionName, args.serialize());
}

/**
 * Get the bytecode of the current address
 *
 * @returns bytecode
 */
export function getBytecode(): StaticArray<u8> {
  return env.getBytecode();
}

/**
 * Retrieves the bytecode of the contract at the given address.
 *
 * @param address - The address of the contract whose bytecode is to be retrieved.
 *
 * @returns The bytecode of the contract.
 *
 * @throws
 * - Throws an error if the contract at the given address does not exist.
 *
 */
export function getBytecodeOf(address: Address): StaticArray<u8> {
  return env.getBytecodeOf(address.toString());
}

/**
 * Checks if the current smart contract caller has write access to the smart contract.
 *
 * @returns A boolean value indicating whether the caller has write access to the smart contract or not.
 *
 */
export function callerHasWriteAccess(): bool {
  return env.callerHasWriteAccess();
}

/**
 * Checks if a function with the given name exists in the bytecode of the contract at the given address.
 *
 * @param address - The address of the contract to check for the existence of the function.
 * @param func - The name of the function to check for existence.
 *
 * @returns A boolean value indicating whether the function exists in the bytecode or not.
 *
 */
export function functionExists(address: Address, func: string): bool {
  return env.functionExists(address.toString(), func);
}

/**
 * Creates a new smart contract with the given bytecode.
 *
 * @remarks
 * Given a bytecode as a `StaticArray<u8>`, creates a new smart contract and returns its address.
 * The context allows you to interact with this smart contract while executing the current bytecode.
 *
 * @param bytecode - The bytecode of the new smart contract.
 *
 * @returns The address of the newly created smart contract.
 *
 * @throws Throws an error if creating the new smart contract fails.
 *
 */
export function createSC(bytecode: StaticArray<u8>): Address {
  return new Address(env.createSC(bytecode));
}

/**
 * Generates an event with the given data within the current smart contract context.
 *
 * @param event - A string representation of the event to generate.
 *
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/**
 * Transfers coins from the current smart contract to the specified address.
 *
 * @param to - The address to which the coins will be transferred.
 * @param amount - The amount of coins to transfer, in the smallest unit.
 *
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toString(), amount);
}

/**
 * Transfers SCE coins of the `from` address to the `to` address.
 *
 * @param from -
 * @param to -
 * @param amount - value in the smallest unit.
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toString(), to.toString(), amount);
}

/**
 * Gets the balance of the current address
 *
 * @returns - value in the smallest unit.
 */
export function balance(): u64 {
  return env.balance();
}

/**
 * Gets the balance of the specified address.
 *
 * @param address - address to get the balance from
 *
 * @returns - value in the smallest unit.
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}

/**
 * Check for key in datastore
 *
 * @param key - key to check
 *
 * @returns - true if key is present in datastore, false otherwise.
 */
export function hasOpKey(key: StaticArray<u8>): bool {
  let result = env.hasOpKey(key);
  // From https://doc.rust-lang.org/reference/types/boolean.html &&
  // https://www.assemblyscript.org/types.html
  // we can safely cast from u8 to bool
  return bool(result[0]);
}

/**
 * Get data associated with the given key from operation datastore
 *
 * @param key - key to get data from
 *
 * @returns - data as a byte array
 */
export function getOpData(key: StaticArray<u8>): StaticArray<u8> {
  return env.getOpData(key);
}

/**
 * Get all keys from operation datastore
 *
 * @returns - a list of key (e.g. a list of byte array)
 */
export function getOpKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getOpKeys();
  return derKeys(keysSer);
}

/**
 * Get keys from datastore
 *
 * @param prefix - the prefix to filter the keys (optional)
 *
 * @returns - a list of key (e.g. a list of byte array)
 */
export function getKeys(
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeys(prefix);
  return derKeys(keysSer);
}

/**
 * Get all keys from datastore
 *
 * @param address - the address in the datastore
 * @param prefix - the prefix to filter the keys (optional)
 *
 * @returns - a list of key (e.g. a list of byte array)
 */
export function getKeysOf(
  address: string,
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeysOf(address, prefix);
  return derKeys(keysSer);
}

/**
 * Read the number of keys from serialized keys array
 *
 * @param arr - Uint8Array
 *
 * @returns The number of keys
 */
function getNumberOfKeys(keysSer: StaticArray<u8>): u32 {
  // The first 4 bytes of the input array represent the number of keys
  let arr = new Uint8Array(4);
  arr[0] = keysSer[0];
  arr[1] = keysSer[1];
  arr[2] = keysSer[2];
  arr[3] = keysSer[3];
  let dv = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  let entryCount = dv.getUint32(0, true /* littleEndian */);
  return entryCount;
}

/**
 * Deserializes an array of keys from the specified serialized format.
 *
 * @param keysSer - The serialized keys.
 * @returns The deserialized keys.
 *
 * ```text
 * Format of keysSer:
 *
 *|---------------|----------|---------------|-----------------------------------------|
 *| Field         | Type     | Size in Bytes | Description                             |
 *|---------------|----------|---------------|-----------------------------------------|
 *| L             | u32      | 4             | Total number of keys in the sequence.   |
 *| V1_L          | u8       | 1             | Length of data for key 1.               |
 *| V1 data       | u8[V1_L] | Variable      | Data for key 1.                         |
 *| V2_L          | u8       | 1             | Length of data for key 2.               |
 *| V2 data       | u8[V2_L] | Variable      | Data for key 2.                         |
 *| ...           |          |               | Data for additional keys (if any).      |
 *|---------------|----------|---------------|-----------------------------------------|
 * ```
 */
export function derKeys(keysSer: StaticArray<u8>): Array<StaticArray<u8>> {
  if (keysSer.length == 0) return [];

  const keyCount: u32 = getNumberOfKeys(keysSer);
  const keys = new Array<StaticArray<u8>>(keyCount);

  let cursor = 4;

  for (let i: u32 = 0; i < keyCount; i++) {
    const keyLen = keysSer[cursor];
    const start = cursor + 1;
    const end = start + keyLen;

    keys[i] = keysSer.slice<StaticArray<u8>>(start, end);

    cursor = end;
  }
  return keys;
}

/**
 * Converts data to base58.
 *
 * @param data -
 *
 */
export function toBase58(data: string): string {
  throw new Error('Not implemented');
}

/**
 * Tests if the signature is valid.
 *
 * @param publicKey - base58check encoded
 * @param digest -
 * @param signature - base58check encoded
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
 * Converts a public key to an address
 *
 * @param pubKey - Base58check encoded
 */
export function publicKeyToAddress(pubKey: string): Address {
  return new Address(env.publicKeyToAddress(pubKey));
}

/**
 * Returns an unsafe random.
 *
 * Warning: this function is unsafe because the random draws is predictable.
 */
export function unsafeRandom(): i64 {
  return env.unsafeRandom();
}

/**
 * Ask to schedule the execution of a function at a given address in the future.
 *
 * @remarks
 * The goal of sendMessage functionality is to send a message in the future, that will be executed as soon as possible
 * after the start period but not after the end period.
 *
 * You might want to use the sendMessage functionality:
 * - Having a smart contract called periodically, without a centralized bot;
 * - Having a smart contract that will trigger on the change of value (for example a change in price), of an other one;
 * - Having an object that evolves on the blockchain itself.
 *
 * This message allows you to make executions in the future and
 * they are executed deterministically on all nodes. The execution is made "as soon as possible" because there is a
 * priority on messages and a limit of messages possibly executed on each slot. More precisely, if you send a low amount
 * of `rawFee` then your message could possibly not executed directly at the first slot of the slot period.
 * If all of the slots of the specified period have a large load of messages, with more fees than you specified, then
 * it's highly likely that your message will never be executed.
 *
 * Additionally, there is an optional filter on a message that adds a new condition on the trigger instead of:
 * "as soon as possible in this range", it becomes
 * "as soon as possible, after this field has been updated, in the state, in this range".
 *
 * As a parameter, you can pass the `filterAddress`, and also an optional datastore `filterKey`.
 *
 * If you pass only an address, then the message will be executed only after:
 * "we are in the range, and a change has happened during this range on the `filterAddress`" (possibly balance etc).
 * If you provide a `filterKey`, the condition of the execution of the message is:
 * "we are in the range, and a change has happened during this range on the `filterAddress` at that datastore
 * `filterKey`"
 *
 * Note: serialization is to be handled at the caller and the callee level.
 *
 * @param at - Address of the contract
 * @param functionName - name of the function in that contract
 * @param validityStartPeriod - Period of the validity start slot
 * @param validityStartThread - Thread of the validity start slot
 * @param validityEndPeriod - Period of the validity end slot
 * @param validityEndThread - Thread of the validity end slot
 * @param maxGas - Maximum gas for the message execution
 * @param rawFee - Fee to be paid for message execution
 * @param coins - Coins of the sender
 * @param msg - function argument serialized in bytes
 * @param filterAddress - If you want your message to be trigger only
 * if a modification is made on a specific address precise it here
 * @param filterKey - If you want your message to be trigger only
 * if a modification is made on a specific storage key of the `filterAddress` precise it here
 */
export function sendMessage(
  at: Address,
  functionName: string,
  validityStartPeriod: u64,
  validityStartThread: u8,
  validityEndPeriod: u64,
  validityEndThread: u8,
  maxGas: u64,
  rawFee: u64,
  coins: u64,
  msg: StaticArray<u8>,
  filterAddress: Address = new Address(),
  filterKey: StaticArray<u8> = new StaticArray<u8>(0),
): void {
  env.sendMessage(
    at.toString(),
    functionName,
    validityStartPeriod,
    validityStartThread,
    validityEndPeriod,
    validityEndThread,
    maxGas,
    rawFee,
    coins,
    msg,
    filterAddress.toString(),
    filterKey,
  );
}

/**
 * Convert given file content to byteArray.
 *
 * Note: this function shall never be called but is dynamically
 * replace using byteArray transformer.
 * More info here:
 *
 * @param filePath -
 */
export function fileToByteArray(
  filePath: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): StaticArray<u8> {
  abort('Please use transformer to dynamically include the file.');
  return [];
}

/**
 * Returns the current period
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Returns the current thread number.
 *
 * @returns The number of the current thread.
 *
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Constructs an event from the given key and arguments.
 *
 * @remarks
 * This function is aimed to be used in conjunction with the `generateEvent` function.
 *
 * @see {@link generateEvent}
 *
 * @param key - The event key.
 *
 * @param args - The array of event arguments.
 *
 * @returns The constructed event as a string.
 *
 * @example
 * ```ts
 * const event = createEvent('myEvent', ['arg1', 'arg2']);
 * ```
 */
export function createEvent(key: string, args: Array<string>): string {
  return `${key}:`.concat(args.join(','));
}

/**
 * Computes the SHA-256 hash of the given data and returns the hash as a `StaticArray<u8>`.
 *
 * @param data - The data to compute the SHA-256 hash of.
 *
 * @returns The computed SHA-256 hash as a `StaticArray<u8>`.
 *
 */
export function sha256(data: StaticArray<u8>): StaticArray<u8> {
  return env.sha256(data);
}

/**
 * Checks if the given address is a valid address.
 *
 * @param address - The address to check.
 *
 * @returns A boolean value indicating whether the address is valid or not.
 *
 */
export function validateAddress(address: string): bool {
  return env.validateAddress(address);
}
