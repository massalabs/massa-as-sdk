import { Args } from '@massalabs/as-types';
import { env } from '../../env';
import { Address } from '../address';

/**
 * Calls a function of a smart contract deployed at a given address.
 *
 * @remarks
 * The serialization of arguments must be handled by the caller and the callee.
 *
 * @param at - The address of the contract where the function will be executed.
 * @param functionName - The name of the function to be called in the contract.
 * @param args - The arguments of the function being called (type: Args).
 * @param coins - The amount of coins to pass if it is a payable function (minimum value is 0).
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
  coins: u64,
): StaticArray<u8> {
  return env.call(at.toString(), functionName, args.serialize(), coins);
}

/**
 * Calls a function from a remote contract and execute it in the current context.
 *
 * @remarks
 * When using localCall, the contract calls a function defined in another smart contract
 * and executes it within its own context. This means that if a datastore key is modified
 * in the called function, the modification will occur in the current smart contract's datastore.
 * This behavior is attributed to the execution taking place "in the current context" of the caller.
 *
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
 * Calls a function from a contract's bytecode in the current context.
 *
 * @remarks
 * This can be useful for testing or debugging purposes,
 * or for calling functions that are not meant to be called from outside the contract.
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
 * Determine if the caller has write access to the data stored in the called smart contract.
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
 * Checks if the given function exists in a smart contract at the given address.
 *
 * @param address - The address of the contract to search in.
 * @param func - The name of the function to search.
 *
 * @returns true if the function exists, false otherwise.
 *
 * @throws
 * - if the given address is not a valid smart contract address.
 *
 */
export function functionExists(address: Address, func: string): bool {
  return env.functionExists(address.toString(), func);
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
 * @param functionParams - function parameters serialized in bytes
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
  functionParams: StaticArray<u8>,
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
    functionParams,
    filterAddress.toString(),
    filterKey,
  );
}

/**
 * Checks if the given function exists in a smart contract at the given address.
 *
 * @returns true if the function exists, false otherwise.
 *
 */
export function getOriginOperationId(): string | null {
  let id = env.getOriginOperationId();
  if (!id.length) {
    return null;
  }
  return id;
}
