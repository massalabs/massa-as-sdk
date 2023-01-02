import { env } from '../env/index';
import { Address } from './address';
import * as Storage from './storage';
import * as Context from './context';
import { Args } from '@massalabs/as-types';

export { Address, Storage, Context };

/**
 * Prints in the node logs
 *
 * @param {string} message Message string
 */
export function print(message: string): void {
  env.print(message);
}

/**
 * Calls a remote function located at given address.
 *
 * Note: arguments serialization is to be handled by the caller and the callee.
 *
 * @param {Address} at
 * @param {string} functionName
 * @param {Args} args
 * @param {u64} coins // TODO define usage
 *
 * @return {StaticArray<u8>} function returned value
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
 * @param {Address} at
 * @param {string} functionName
 * @param {Args} args
 *
 * @return {StaticArray<u8>} function returned value
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
 * @param {StaticArray<u8>} bytecode
 * @param {string} functionName
 * @param {Args} args
 *
 * @return {StaticArray<u8>} function returned value
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
 * @return {StaticArray<u8>} bytecode
 */
export function getBytecode(): StaticArray<u8> {
  return env.getBytecode();
}

/**
 * Get the bytecode of the current address
 *
 * @param {Address} address
 *
 * @return {StaticArray<u8>} bytecode
 */
export function getBytecodeFor(address: Address): StaticArray<u8> {
  return env.getBytecodeFor(address.toByteString());
}

/**
 * Check if the SC caller has a write access on it
 *
 * @return {bool}
 */
export function callerHasWriteAccess(): bool {
  return env.callerHasWriteAccess();
}

/**
 * Check if `function` exists in the bytecode stored at `address`
 *
 * @param {Address} addr
 *
 * @return {bool}
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
 * @param {StaticArray<u8>} bytecode
 *
 * @return {string} Smart contract address
 */
export function createSC(bytecode: StaticArray<u8>): Address {
  return Address.fromByteString(env.createSC(bytecode));
}

/**
 * Generates an event
 *
 * @param {string} event - stringified
 */
export function generateEvent(event: string): void {
  env.generateEvent(event);
}

/**
 * Transfers SCE coins from the current address to given address.
 *
 * @param {Address} to
 * @param {u64} amount - value in the smallest unit.
 */
export function transferCoins(to: Address, amount: u64): void {
  env.transferCoins(to.toByteString(), amount);
}

/**
 * Transfers SCE coins of the `from` address to the `to` address.
 *
 * @param {Address} from
 * @param {Address} to
 * @param {u64} amount - value in the smallest unit.
 */
export function transferCoinsOf(from: Address, to: Address, amount: u64): void {
  env.transferCoinsOf(from.toByteString(), to.toByteString(), amount);
}

/**
 * Gets the balance of the current address
 *
 * @return {u64} - value in the smallest unit.
 */
export function balance(): u64 {
  return env.balance();
}

/**
 * Gets the balance of the specified address.
 *
 * @param {string} address
 *
 * @return {u64} - value in the smallest unit.
 */
export function balanceOf(address: string): u64 {
  return env.balanceOf(address);
}

/**
 * Check for key in datastore
 *
 * @param {StaticArray<u8>} key
 *
 * @return {bool} - true if key is present in datastore, false otherwise.
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
 * @param {StaticArray<u8>} key
 *
 * @return {StaticArray<u8>} - data as a byte array
 */
export function getOpData(key: StaticArray<u8>): StaticArray<u8> {
  return env.getOpData(key);
}

/**
 * Get all keys from operation datastore
 *
 * @return {StaticArray<u8>} - a list of key (e.g. a list of bytearray)
 */
export function getOpKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getOpKeys();
  return derKeys(keysSer);
}

/**
 * Get all keys from datastore
 *
 * @return {StaticArray<u8>} - a list of key (e.g. a list of bytearray)
 */
export function getKeys(): Array<StaticArray<u8>> {
  let keysSer = env.getKeys();
  return derKeys(keysSer);
}

/**
 * Get all keys from datastore
 *
 * @return {StaticArray<u8>} - a list of key (e.g. a list of bytearray)
 */
export function getKeysOf(address: string): Array<StaticArray<u8>> {
  let keysSer = env.getKeysOf(address);
  return derKeys(keysSer);
}

/**
 * Internal function - used by getOpKeys
 *
 * @param {StaticArray<u8>} keysSer TBD
 * @return {Array<StaticArray<u8>>} TBD
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
 * @param {string} data
 *
 * @return {string}
 */
export function toBase58(data: string): string {
  return env.toBase58(data);
}

/**
 * Tests if the signature is valid.
 *
 * @param {string} publicKey - base58check encoded
 * @param {string} digest
 * @param {string} signature - base58check encoded

 * @return {bool}
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
 * @param {string} pubKey -  Base58check endoded
 *
 * @return {Address}
 */
export function publicKeyToAddress(pubKey: string): Address {
  return Address.fromByteString(env.publicKeyToAddress(pubKey));
}

/**
 * Returns an unsafe random.
 *
 * /!\ This function is unsafe because the random draws is predictable.
 *
 * @return {i64}
 */
export function unsafeRandom(): i64 {
  return env.unsafeRandom();
}

/**
 * Sends an async message to a function at given address.
 *
 * Note: serialization is to be handled at the caller and the callee level.
 *
 * @param {string} at
 * @param {string} functionName
 * @param {u64} validityStartPeriod - Period of the validity start slot
 * @param {u8} validityStartThread - Thread of the validity start slot
 * @param {u64} validityEndPeriod - Period of the validity end slot
 * @param {u8} validityEndThread - Thread of the validity end slot
 * @param {u64} maxGas - Maximum gas for the message execution
 * @param {u64} rawFee - Fee to be paid for message execution
 * @param {u64} coins - Coins of the sender
 * @param {StaticArray<u8>} msg - serialized data
 * @param {Address} filterAddress - If you want your message to be trigger only
 * if a modification is made on a specific address precise it here
 * @param {StaticArray<u8>} filterKey - If you want your message to be trigger only
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
 * @param {string} filePath
 *
 * @return {StaticArray<u8>}
 */
export function fileToByteArray(
  filePath: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): StaticArray<u8> {
  abort('Please use transformer to dynamically include the file.');
  return [];
}

/**
 * Returns the current period
 * @return {u8}
 */
export function currentPeriod(): u64 {
  return env.currentPeriod();
}

/**
 * Returns the current thread
 * @return {u8}
 */
export function currentThread(): u8 {
  return env.currentThread();
}

/**
 * Helper function to transform a string to a StaticArray<u8>
 * @param {string} str
 * @return {StaticArray<u8>}
 */
export function toBytes(str: string): StaticArray<u8> {
  let arr = new StaticArray<u8>(str.length << 1);
  memory.copy(changetype<usize>(arr), changetype<usize>(str), arr.length);
  return arr;
}

/**
 * Helper function to transform a StaticArray<u8> to a string
 * @param {StaticArray<u8>} arr
 * @return {string}
 */
export function fromBytes(arr: StaticArray<u8>): string {
  let str = changetype<string>(__new(arr.length, idof<string>()));
  memory.copy(changetype<usize>(str), changetype<usize>(arr), arr.length);
  return str;
}
