import {env} from '../env/index';
import {Address} from './address';
import * as Storage from './storage';
import * as Context from './context';
import {MAX_DATASTORE_ENTRY_COUNT} from './constant';

export {Address, Storage, Context};

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
 * @param {string} args
 * @param {u64} coins // TODO define usage
 *
 * @return {string} function returned value (serialized)
 */
export function call(
  at: Address,
  functionName: string,
  args: string,
  coins: u64,
): string {
  return env.call(at.toByteString(), functionName, args, coins);
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
 * @param {string} bytecode - base64 encoded
 *
 * @return {string} Smart contract address
 */
export function createSC(bytecode: string): Address {
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
 * @param {Uint8Array} key
 *
 * @return {bool} - true if key is present in datastore, false otherwise.
 */
export function hasOpKey(key: Uint8Array): bool {
  let result = env.hasOpKey(key.buffer);
  // From https://doc.rust-lang.org/reference/types/boolean.html &&
  // https://www.assemblyscript.org/types.html
  // we can safely cast from u8 to bool
  return bool(result[0]);
}

/*
 * Get data associated with the given key from datastore
 *
 * @param {StaticArray<u8>} key
 *
 * @return {Uint8Array} - data as a byte array
 */
export function getOpData(key: Uint8Array): Uint8Array {
  let result_ = env.getOpData(key.buffer);
  return Uint8Array.wrap(result_);
}

/*
 * Get all keys from datastore
 *
 * @return {Array<Uint8Array>} - a list of key (e.g. a list of bytearray)
 */
export function getOpKeys(): Array<Uint8Array> {
  let buf = env.getOpKeys();
  let keys_ser: Uint8Array = Uint8Array.wrap(buf);
  return derOpKeys(keys_ser);
}

/*
 * Internal function - used by getOpKeys
 */
export function derOpKeys(keys_ser: Uint8Array): Array<Uint8Array> {

  if (keys_ser.length == 0) {
    return new Array<Uint8Array>();
  }

  // Datastore deserialization
  // Format is: L (u32); V1_L (u8); V1 data (u8*V1_L); ...
  // u8 * 4 (LE) => u32
  let dv = new DataView(keys_ser.buffer, 0, 4);
  let entry_count = dv.getUint32(0, true /* littleEndian */);

  let cursor = 4;
  let keys_der = new Array<Uint8Array>(entry_count);
  for (let i: u32 = 0; i < entry_count; i++) {
    let end = cursor + keys_ser[cursor] + 1;
    // keys_der[i] = keys_ser.subarray(cursor + 1, end); // no copy here
    // Need a copy here otherwise weird things will happen
    let ar_ = keys_ser.subarray(cursor + 1, end);
    let ar = new Uint8Array(ar_.length);
    ar.set(ar_); // copy subarray into dest
    keys_der[i] = ar;

    cursor = end;
  }

  return keys_der;
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
 * @param {u64} gasPrice - Price of one gas unit
 * @param {u64} coins - Coins of the sender
 * @param {string} msg - serialized data
 */
export function sendMessage(
  at: Address,
  functionName: string,
  validityStartPeriod: u64,
  validityStartThread: u8,
  validityEndPeriod: u64,
  validityEndThread: u8,
  maxGas: u64,
  gasPrice: u64,
  coins: u64,
  msg: string,
): void {
  env.sendMessage(
    at.toByteString(),
    functionName,
    validityStartPeriod,
    validityStartThread,
    validityEndPeriod,
    validityEndThread,
    maxGas,
    gasPrice,
    coins,
    msg,
  );
}

/**
 * Convert given file content to base64.
 *
 * Note: this function shall never be called but is dynamically
 * replace using base64 transformer.
 * More info here:
 *
 * @param {string} filePath
 *
 * @return {string}
 */
export function fileToBase64(
  filePath: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  abort('Please use base64 transformer to dynamically include the file.');
  return '';
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
