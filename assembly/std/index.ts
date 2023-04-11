/**
 * This module contains functions for working with Massa's blockchain,
 * including making transactions, manipulating smart-contracts and their bytecode,
 * calling other smart-contracts functions, and providing various utility functions.
 *
 * @remarks
 *
 * You can use the {@link call}, {@link localCall} and {@link localExecution} functions to call other
 * smart-contracts by specifying the function name and either the other smart-contract
 * address or its bytecode.
 *
 * The {@link sendMessage} function is similar to 'call' functions but it is used to call functions with cron jobs
 * as it is part of the new autonomous smart-contracts features.
 *
 * The {@link createSC}, {@link getBytecode} and {@link getBytecodeOf} functions are used to create smart-contracts
 * and manipulate them by their bytecode.
 *
 * The {@link transferCoins}, {@link transferCoinsOf}, {@link balance} and {@link balanceOf} functions are used to
 * transfer SCE coins between contracts.
 *
 * The {@link functionExists} function is used to check if a function exists in a smart-contract's bytecode.
 *
 * The {@link callerHasWriteAccess} function is used to check if the caller has write access on the smart-contract's
 * data.
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
 *
 */

import { env } from '../env/index';
import { Address } from './address';
import * as Storage from './storage';
import * as Context from './context';
import { Args } from '@massalabs/as-types';

export { Address, Storage, Context };

/**
 * Logs a string message in the massa-node logs.
 *
 * @param message - The string message to be logged in the node.
 *
 */
export function print(message: string): void {
  env.print(message);
}

/**
 * Calls a function of a smart-contract deployed at a given address, with
 * the specified arguments and optional coins to be sent to the function.
 *
 * @remarks
 * The serialization of arguments must be handled by the caller and the callee.
 *
 * @param at - The address of the contract where the function will be executed.
 * @param functionName - The name of the function to be called in the contract.
 * @param args - The arguments of the function we are calling (type: Args).
 * @param coins - An optional amount of coins to send with the function call if it is a payable function.
 *
 * @returns The return value of the executed function, serialized as a 'StaticArray<u8>'.
 *
 * @throws
 * - if the given address is not a valid address.
 * - if the function doesn't exist in the contract to call.
 *
 */
export function call(
  at: Address,
  functionName: string,
  args: Args,
  coins: u64 = 0,
): StaticArray<u8> {
  return env.call(at.toString(), functionName, args.serialize(), coins);
}

/**
 * Calls a function from a remote contract in the current context.
 *
 * @remarks
 * Arguments serialization is to be handled by the caller and the callee.
 *
 * @param at - The address of the contract from where the function is located.
 * @param functionName - The name of the function to call in the current context.
 * @param args - The arguments of the function we are calling.
 *
 * @returns The return value of the executed function, serialized as a 'StaticArray<u8>'.
 *
 * @throws
 * - if the given address is not a valid address.
 * - if the function doesn't exist in the contract to call.
 *
 */
export function localCall(
  at: Address,
  functionName: string,
  args: Args,
): StaticArray<u8> {
  return env.localCall(at.toString(), functionName, args.serialize());
}

/**
 * Calls a function in a contract as if it were called by
 * another function in the same contract, using the provided `bytecode` as the source code
 * for the contract. This can be useful for testing or debugging purposes,
 * or for calling functions that are not meant to be called from outside the contract.
 *
 * @remarks
 * Arguments serialization is to be handled by the caller and the callee.
 *
 * @param bytecode - The bytecode of the contract containing the function to execute.
 * @param functionName - The name of the function to call in that contract.
 * @param args - The arguments of the function we are calling.
 *
 * @returns The return value of the executed function, serialized as a 'StaticArray<u8>'.
 *
 * @throws
 * - if the function doesn't exist in the bytecode
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
 * Retrieves the bytecode of the contract that is currently being executed.
 *
 * @remarks
 * Bytecode is a low-level representation of a smart contract's code that can be executed by the blockchain.
 *
 * @returns The bytecode of the contract, serialized as a 'StaticArray<u8>'.
 *
 */

export function getBytecode(): StaticArray<u8> {
  return env.getBytecode();
}

/**
 * Retrieves the bytecode of the remote contract at the given 'address'.
 *
 * @remarks
 * Bytecode is a low-level representation of a smart contract's code that can be executed by the blockchain.
 *
 * @param address - The address of the contract's bytecode to retrieve.
 *
 * @returns The bytecode of the contract, serialized as a 'StaticArray<u8>'.
 *
 * @throws
 * - if the given address is not a valid smart-contract address.
 *
 */
export function getBytecodeOf(address: Address): StaticArray<u8> {
  return env.getBytecodeOf(address.toString());
}

/**
 * Determine if the caller has write access to the data stored in the called smart-contract.
 *
 * @remarks
 * This function returns true exclusively when a new smart contract is deployed using the
 * 'create_new_sc_address()' function.
 * When calling {@link createSC}, the User or smart contract will be granted write
 * access to the created SC, but this privilege is limited to the context of this specific operation.
 *
 * @returns Returns true if the caller has write access; false otherwise.
 *
 */
export function callerHasWriteAccess(): bool {
  return env.callerHasWriteAccess();
}

/**
 * Creates a new smart contract on the ledger using its bytecode representation.
 *
 * @remarks
 * After executing this function, you will have write access on the newly generated contract.
 *
 * @see {@link callerHasWriteAccess} for more information.
 *
 * @param bytecode - The byte code of the contract to create.
 *
 * @returns The address of the newly created smart contract on the ledger.
 *
 */
export function createSC(bytecode: StaticArray<u8>): Address {
  return new Address(env.createSC(bytecode));
}

/**
 * Checks if the given function exists in a smart-contract at the given address.
 *
 * @param address - The address of the contract to search in.
 * @param func - The name of the function to search.
 *
 * @returns true if the function exists, false otherwise.
 *
 * @throws
 * - if the given address is not a valid smart-contract address.
 *
 */
export function functionExists(address: Address, func: string): bool {
  return env.functionExists(address.toString(), func);
}

/**
 * Generates a string event that is then emitted by the blockchain and can be listened off-chain.
 *
 * @see [massa smart-contracts examples](https://github.com/massalabs/massa-sc-examples) to see how to listen
 * such events in a web3 application.
 *
 * @param event - The string event to emit.
 *
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/**
 * Transfers SCE coins from the current address to given address.
 *
 * @param to - the address to send coins to.
 * @param amount - value in the smallest unit.
 *
 * @throws
 * - if the given address is not a valid address.
 * - if the balance of the current address is insufficient to make the transaction.
 *
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toString(), amount);
}

/**
 * Transfers SCE coins 'from' a given address 'to' another given address.
 *
 * @remarks
 * The transfer is done only after approval.
 *
 * @param from - the sender address.
 * @param to - the address to send coins to.
 * @param amount - value in the smallest unit.
 *
 * @throws
 * - if the sender's or the receiver address is not a valid address.
 * - if the balance of the sender's address is insufficient to make the transaction.
 *
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toString(), to.toString(), amount);
}

/**
 * Gets the balance of the current address.
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
 * @throws
 * - if the given address is not a valid address.
 *
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}

/**
 * Checks if a given serialized 'key' is present in the operation datastore.
 *
 * @param key - the serialized key to look for in the datastore.
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
 * Retrieves the data associated with the given key from the operation datastore.
 *
 * @param key - the serialized key to look for in the datastore.
 *
 * @returns - the serialized data associated with the given key as a byte array.
 *
 * @throws
 * - if the key is not present in the datastore.
 *
 */
export function getOpData(key: StaticArray<u8>): StaticArray<u8> {
  return env.getOpData(key);
}

/**
 * Retrieves all the keys from the operation datastore.
 *
 * @returns - a list of serialized keys (e.g. a list of byte array)
 *
 */
export function getOpKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getOpKeys();
  return derKeys(keysSer);
}

/**
 * Retrieves all the keys from the operation datastore.
 * It allows to filter the keys by an optional prefix.
 *
 * @param prefix - the serialized prefix to filter the keys (optional)
 *
 * @returns - a list of serialized keys (e.g. a list of byte array)
 *
 */
export function getKeys(
  prefix: StaticArray<u8> = new StaticArray<u8>(0),
): Array<StaticArray<u8>> {
  let keysSer = env.getKeys(prefix);
  return derKeys(keysSer);
}

/**
 * Retrieves all the keys from the operation datastore from a remote address.
 * It allows to filter the keys by an optional prefix.
 *
 * @param address - the address in the datastore
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
 * Converts the given string data into a base58 formatted string.
 *
 * @param data - the string data to convert to base58.
 *
 * @returns the converted data as a string.
 *
 */
export function toBase58(data: string): string {
  return env.toBase58(data);
}

/**
 * Checks if the given signature is valid using a public key.
 *
 * @param publicKey - base58check encoded public key
 * @param digest - digest message
 * @param signature - base58check encoded signature
 *
 * @returns 'true' if the signature is valid for the passed key, 'false' otherwise.
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
 * Retrieves an Address object from the given public key.
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
 * Generates a pseudo-random integer.
 *
 * @remarks
 * This function is unsafe because the random draws are predictable.
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
 *
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
 * @see [as-transformer](https://github.com/massalabs/as/tree/main/packages/as-transformer#file2bytearray)
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
 * Retrieves the current period of the network.
 *
 * @returns the current period as u64.
 *
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Retrieves the current thread of the network.
 *
 * @returns the current thread as u8.
 *
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Constructs a pretty formatted event with given key and arguments.
 * It is useful to generate events with array formatted data.
 *
 * @remarks
 * The generated event is meant to be used with the {@link generateEvent} function.
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

/**
 * Computes the checksum, with the 'sha256' algorithm, of the given contract's bytecode.
 *
 * @param bytecode - the bytecode for which to compute the checksum.
 *
 * @returns the serialized computed checksum.
 *
 */
export function sha256(bytecode: StaticArray<u8>): StaticArray<u8> {
  return env.sha256(bytecode);
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
