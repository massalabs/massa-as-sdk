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
 * Calls a remote function located at given address.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param at -
 * @param functionName -
 * @param args -
 * @param coins -
 *
 * @returns function returned value
 */
export function call(
  at: Address,
  functionName: string,
  args: Args,
  coins: u64,
): StaticArray<u8> {
  return env.call(at.toByteString(), functionName, args.serialize(), coins);
}

/**
 * Calls a remote function located at given address within the current context.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param at -
 * @param functionName -
 * @param args -
 *
 * @returns function returned value
 */
export function localCall(
  at: Address,
  functionName: string,
  args: Args,
): StaticArray<u8> {
  return env.localCall(at.toByteString(), functionName, args.serialize());
}

/**
 * Executes a given bytecode within the current context.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param bytecode -
 * @param functionName -
 * @param args -
 *
 * @returns function returned value
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
 * Get the bytecode of the current address
 *
 * @param address -
 *
 * @returns bytecode
 */
export function getBytecodeOf(address: Address): StaticArray<u8> {
  return env.getBytecodeOf(address.toByteString());
}

/**
 * Check if the SC caller has a write access on it
 *
 */
export function callerHasWriteAccess(): bool {
  return env.callerHasWriteAccess();
}

/**
 * Checks if `function` exists in the bytecode stored at `address`
 * @param address -
 * @param func -
 */
export function functionExists(address: Address, func: string): bool {
  return env.functionExists(address.toByteString(), func);
}

/**
 * Creates a new smart contract.
 *
 * Take a base64 string representing the module binary and create an entry in
 * the ledger.
 *
 * The context allow you to write in this smart contract while you're executing
 * the current bytecode.
 *
 * @param bytecode -
 *
 * @returns Smart contract address
 */
export function createSC(bytecode: StaticArray<u8>): Address {
  return Address.fromByteString(env.createSC(bytecode));
}

/**
 * Generates an event
 *
 * @param event - stringified
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/**
 * Transfers SCE coins from the current address to given address.
 *
 * @param to -
 * @param amount - value in the smallest unit.
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toByteString(), amount);
}

/**
 * Transfers SCE coins of the `from` address to the `to` address.
 *
 * @param from -
 * @param to -
 * @param amount - value in the smallest unit.
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toByteString(), to.toByteString(), amount);
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
 * @param address -
 *
 * @returns - value in the smallest unit.
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}

/**
 * Check for key in datastore
 *
 * @param key -
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
 * Get data associated with the given key from datastore
 *
 * @param key -
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
 * Get all keys from datastore
 *
 * @returns - a list of key (e.g. a list of byte array)
 */
export function getKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getKeys();
  return derKeys(keysSer);
}

/**
 * Get all keys from datastore
 *
 * @param address - the address in the datastore
 * @returns - a list of key (e.g. a list of byte array)
 */
export function getKeysOf(address: string): Array<StaticArray<u8>> {
  let keysSer = env.getKeysOf(address);
  return derKeys(keysSer);
}

/**
 * Internal function - used by getOpKeys
 *
 * @param keysSer - TBD
 * @returns - TBD
 */
export function derKeys(keysSer: StaticArray<u8>): Array<StaticArray<u8>> {
  if (keysSer.length == 0) {
    return [];
  }

  // Datastore deserialization
  // Format is: L (u32); V1_L (u8); V1 data (u8*V1_L); ...
  // u8 * 4 (LE) => u32
  let ar = new Uint8Array(4);
  ar[0] = keysSer[0];
  ar[1] = keysSer[1];
  ar[2] = keysSer[2];
  ar[3] = keysSer[3];
  let dv = new DataView(ar.buffer, ar.byteOffset, ar.byteLength);
  let entryCount = dv.getUint32(0, true /* littleEndian */);

  let cursor = 4;
  let keysDer = new Array<StaticArray<u8>>(entryCount);
  for (let i: u32 = 0; i < entryCount; i++) {
    let end = cursor + keysSer[cursor] + 1;
    keysDer[i] = StaticArray.slice(keysSer, cursor + 1, end);

    cursor = end;
  }

  return keysDer;
}

/**
 * Converts data to base58.
 *
 * @param data -
 *
 */
export function toBase58(data: string): string {
  return env.toBase58(data);
}

/**
 * Tests if the signature is valid.
 *
 * @param publicKey - base58check encoded
 * @param digest -
 * @param signature - base58check encoded

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
  return Address.fromByteString(env.publicKeyToAddress(pubKey));
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
    at.toByteString(),
    functionName,
    validityStartPeriod,
    validityStartThread,
    validityEndPeriod,
    validityEndThread,
    maxGas,
    rawFee,
    coins,
    msg,
    filterAddress.toByteString(),
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
 * Returns the current thread
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Helper function to transform a string to a StaticArray<u8>
 * @deprecated now use as-types helpers
 * @param str -
 */
export function toBytes(str: string): StaticArray<u8> {
  let arr = new StaticArray<u8>(str.length << 1);
  memory.copy(changetype<usize>(arr), changetype<usize>(str), arr.length);
  return arr;
}

/**
 * Helper function to transform a StaticArray<u8> to a string
 * @deprecated now use as-types helpers
 * @param arr -
 */
export function fromBytes(arr: StaticArray<u8>): string {
  let str = changetype<string>(__new(arr.length, idof<string>()));
  memory.copy(changetype<usize>(str), changetype<usize>(arr), arr.length);
  return str;
}

/**
 * Constructs an event given a key and arguments
 *
 * @see {@link generateEvent}
 *
 * @param key - event key
 * @param args - array of string arguments.
 * @returns stringified event.
 */
export function createEvent(key: string, args: Array<string>): string {
  return `${key}:`.concat(args.join(','));
}
