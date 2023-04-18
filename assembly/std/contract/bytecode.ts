import { env } from '../../env';
import { Address } from '../address';

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
 * - if the given address is not a valid smart contract address.
 *
 */
export function getBytecodeOf(address: Address): StaticArray<u8> {
  return env.getBytecodeOf(address.toString());
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
