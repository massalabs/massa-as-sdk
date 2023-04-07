/**
 * This module contains functions for interacting with Massa's blockchain, it describes all standarts functions.
 *
 * This module therefore provides functions to make transactions, manipulate smart-contracts and their bytecode,
 * call other smart-contracts functions and provides many more usefull utilities functions.
 *
 * @remarks
 *
 * The {@link call}, {@link localCall} and {@link localExecution} functions are used to call other
 * smart-contracts functions by using the function name and either the other smart-contract
 * address or the bytecode of the other smart-contract.
 *
 * The {@link sendMessage} function is close to 'call' functions but it is used to call functions with cron jobs
 * as it is part of the new autonomous smart-contracts features.
 *
 * The {@link createSC}, {@link getBytecode} and {@link getBytecodeOf} functions are used to manipulate smart-contracts
 * and their bytecode.
 *
 * The {@link transferCoins}, {@link transferCoinsOf}, {@link balance} and {@link balanceOf} functions are used to
 * manipulate SCE coins between contracts.
 *
 * The {@link functionExists} function is used to check if a function exists in a smart-contract's bytecode.
 *
 * The {@link callerHasWriteAccess} function is used to check if the caller has write access on the smart-contract.
 *
 * The {@link generateEvent} function is used to generate an event in the blockchain
 * that can be fetched using [the massa-web3 module](https://github.com/massalabs/massa-web3).
 *
 * The {@link hasOpKey}, {@link getOpData}, {@link getKeys}, {@link getOpKeys},
 * {@link getKeysOf} and {@link derKeys} functions are used to manipulate
 * the interact with the Op datastore which is used as a key-store for operations
 * and pass much larger data sets between operations.
 *
 * @privateRemarks
 * It is not possible in AssemblyScript to catch thrown exceptions.
 * All exceptions thrown by functions in this module will stop the execution of the smart contract.
 *
 * You can see that your smart contract execution is stopped by looking at the events.
 *
 * @packageDocumentation
 */

import { env } from '../env/index';
import { Address } from './address';
import * as Storage from './storage';
import * as Context from './context';
import { Args } from '@massalabs/as-types';

export { Address, Storage, Context };

/**
 * Prints in the node logs
 *
 * @param message - Message string to log in node
 *
 */
export function print(message: string): void {
  env.print(message);
}

/**
 * Calls a remote function located at given address.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param at - The address of the contract.
 *
 * @param functionName - The name of the function to call in that contract.
 *
 * @param args - The arguments of the function we are calling (type: Args).
 *
 * @param coins - If the function to call is a payable function, pass coins to it with this argument.
 *
 * @throws
 *    - the address doesn't exist
 *    - the function doesn't exist in the contract
 *
 * @returns the return value of the executed function
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
 * Calls a remote function located at given address within the current context.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param at - The address of the contract.
 *
 * @param functionName - The name of the function to call in that contract.
 *
 * @param args - The arguments of the function we are calling.
 *
 * @throws
 *    - the address doesn't exist
 *    - the function doesn't exist in the contract
 *
 * @returns the return value of the executed function
 */
export function localCall(
  at: Address,
  functionName: string,
  args: Args,
): StaticArray<u8> {
  return env.localCall(at.toString(), functionName, args.serialize());
}

/**
 * Executes a given bytecode within the current context.
 *
 *
 * @remarks
 * - Arguments serialization is to be handled by the caller and the callee.
 *
 * @param bytecode - The bytecode of the contract containing the function to execute.
 *
 * @param functionName - The name of the function to call in that contract.
 *
 * @param args - The arguments of the function we are calling.
 *
 * @returns the return value of the executed function
 *
 * @throws
 *    - Runtime exception if the function doesn't exist in the bytecode
 *
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
 * @returns the bytecode of the contract
 *
 */
export function getBytecode(): StaticArray<u8> {
  return env.getBytecode();
}

/**
 * Get the bytecode of the current address
 *
 *
 * @param address - The address of the contract to fetch
 *
 * @returns The serialized bytecode of the contract
 *
 * @throws
 *   - Runtime exception if the address doesn't exist
 *
 */
export function getBytecodeOf(address: Address): StaticArray<u8> {
  return env.getBytecodeOf(address.toString());
}

/**
 * Determine if the caller has write access to the data stored in the called smart contract.
 *
 * @returns Returns true if the caller has write access; false otherwise.
 *
 * @remarks
 * This function returns true exclusively when a new smart contract is deployed using the
 * 'create_new_sc_address()' function.
 * When calling 'callerHasWriteAccess()', the User or smart contract will be granted write
 * access to the created SC, but this privilege is limited to the context of this specific operation.
 *
 */
export function callerHasWriteAccess(): bool {
  return env.callerHasWriteAccess();
}

/**
 * Checks if `function` exists in the bytecode stored at `address`
 *
 * @param address - The address of the contract to search in.
 *
 * @param func - The name of the function to search.
 *
 * @returns true if the function exists, false otherwise.
 */
export function functionExists(address: Address, func: string): bool {
  return env.functionExists(address.toString(), func);
}

/**
 * Creates a new smart contract.
 *
 * Takes a byte array which is the bytecode of the contract to create.
 *
 * The context allow you to write in this smart contract while you're executing
 * the current bytecode.
 *
 * @param bytecode - The byte code of the contract to create
 *
 * @returns The address of the newly created smart contract on the ledger
 *
 */
export function createSC(bytecode: StaticArray<u8>): Address {
  return new Address(env.createSC(bytecode));
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
 * @param to - the address to send coins to.
 * @param amount - value in the smallest unit.
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toString(), amount);
}

/**
 * Transfers coins of the `from` address to the `to` address.
 *
 * @param from - the sender address
 *
 * @param to - the address to send coins to
 *
 * @param amount - value in the smallest unit
 *
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toString(), to.toString(), amount);
}

/**
 * Gets the balance of the current address
 *
 * @returns - value in the smallest unit.
 *
 */
export function balance(): u64 {
  return env.balance();
}

/**
 * Gets the balance of the specified address.
 *
 * @param address - the address on which the balance is checked.
 *
 * @returns - value in the smallest unit.
 *
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}

/**
 * Check for key in datastore
 *
 * @param key - the (serialized?) key to check for
 *
 * @returns - true if key is present in datastore, false otherwise.
 *
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
 * @param key - the (serialized?) key of the data to get.
 *
 * @returns - data as a byte array
 *
 */
export function getOpData(key: StaticArray<u8>): StaticArray<u8> {
  return env.getOpData(key);
}

/**
 * Get all keys from operation datastore
 *
 * @returns - a list of key (e.g. a list of byte array)
 *
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
 *
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
 *
 * @param prefix - the prefix to filter the keys (optional)
 *
 * @returns - a list of key (e.g. a list of byte array)
 *
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
 * @param arr - Uint8Array keys array
 *
 * @returns The number of keys in the  keys array
 *
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
 *
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
 * @param data - the string data to convert to base58.
 *
 * @returns the converted data
 *
 */
export function toBase58(data: string): string {
  return env.toBase58(data);
}

/**
 * Tests if the signature is valid.
 *
 * @param publicKey - base58check encoded public key of wallet
 * @param digest - digest message
 * @param signature - base58check encoded signature of wallet
 *
 * @returns 'true' if the signature is valid for the passed key, 'false' otherwise.
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
 * @param pubKey - Base58check encoded public key of the address
 *
 * @returns the fetched address as a string
 *
 */
export function publicKeyToAddress(pubKey: string): Address {
  return new Address(env.publicKeyToAddress(pubKey));
}

/**
 * @remarks
 * This function is unsafe because the random draws is predictable.
 *
 * @returns the unsafe randomly generated number as i64.
 *
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
 * @remarks
 * This function shall NEVER be called, it is dynamically replaced using the byteArray converter.
 * [See more about the transformer](https://github.com/massalabs/as/tree/main/packages/as-transformer#file2bytearray)
 *
 * @param filePath - the file path to convert
 *
 */
export function fileToByteArray(
  filePath: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): StaticArray<u8> {
  abort('Please use transformer to dynamically include the file.');
  return [];
}

/**
 * Returns the current period
 *
 * @returns the current period as u64
 *
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Returns the current thread
 *
 * @returns the current thread as u8
 *
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Constructs an event given a key and arguments
 *
 * @see {@link generateEvent}
 *
 * @param key - event key
 *
 * @param args - array of string arguments.
 *
 * @returns stringified event.
 *
 */
export function createEvent(key: string, args: Array<string>): string {
  return `${key}:`.concat(args.join(','));
}

/**
 * Computing the sha256 of the passed parameter and return the hash as a byte array.
 *
 * @param bytecode - StaticArray<u8>
 *
 * @returns - Computed Sha256 in StaticArray<u8>
 *
 */
export function sha256(bytecode: StaticArray<u8>): StaticArray<u8> {
  return env.sha256(bytecode);
}

/**
 * Checks if the address is valid.
 *
 * @param address - Address to check
 *
 * @returns boolean - true if the address is valid, false otherwise
 *
 */
export function validateAddress(address: string): bool {
  return env.validateAddress(address);
}
