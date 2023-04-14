/**
 * This module contains functions for working with Massa's blockchain,
 * including making transactions, manipulating smart contracts and their bytecode,
 * calling other smart contracts functions, and providing various utility functions.
 *
 * @remarks
 *
 * You can use the {@link call}, {@link localCall} and {@link localExecution} functions to call other
 * smart contracts by specifying the function name and either the other smart contract
 * address or its bytecode.
 *
 * The {@link sendMessage} function is similar to 'call' functions but it is used to schedule a call
 * as it is part of the new autonomous smart contracts features.
 *
 * The {@link createSC}, {@link getBytecode} and {@link getBytecodeOf} functions are used to create smart contracts
 * and manipulate them by their bytecode.
 *
 * The {@link transferCoins}, {@link transferCoinsOf}, {@link balance} and {@link balanceOf} functions are used to
 * manage the transfer and retrieval of coins between contracts.
 *
 * The {@link functionExists} function is used to check if a function exists in a smart contract's bytecode.
 *
 * The {@link callerHasWriteAccess} function is used to check if the caller has write access on the smart contract's
 * data.
 *
 * The {@link generateEvent} function is used to generate an event in the blockchain
 * that can be fetched using [the massa-web3 module](https://github.com/massalabs/massa-web3).
 *
 * The {@link hasOpKey}, {@link getOpData}, {@link getKeys}, {@link getOpKeys},
 * {@link getKeysOf} and {@link derKeys} functions are used to manipulate
 * the interact with the operation datastore which is used as a key-store for operations
 * and pass much larger data sets between operations.
 *
 * @privateRemarks
 * It is not possible in AssemblyScript to catch thrown exceptions.
 * All exceptions thrown by functions in this module will stop the execution of the smart contract.
 *
 * You can see that your smart contract execution is stopped by looking at the events.
 *
 * @module Std
 *
 */

import { Address } from './address';
import * as Storage from './storage';
import * as Context from './context';
import * as OpDatastore from './op-datastore';
import * as Contract from './contract';
import * as Utilities from './utils';
import * as Coins from './coins';

export { Address, Storage, Context, OpDatastore, Contract, Utilities, Coins };

// op-datastore/index.ts
/**
 * @module Operation-Datastore
 */
export * from './op-datastore';

// contract/index.ts
/**
 * @module Contract
 */
export * from './contract';

// utils/index.ts
/**
 * @module Utilities
 */
export * from './utils';

// coins/index.ts
/**
 * @module Coins
 */
export * from './coins';
