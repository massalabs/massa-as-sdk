///////////////////////////////
////////////////////////////
////////////////////////
// WIP allowance, and transferFrom Missing
////////////////////////
////////////////////////////
///////////////////////////////

import {Address, Storage, Context, generateEvent} from '../std';
const ownerTokenKey: string = 'ownerOf_';
const counterKey: string = 'Counter';
const ownerKey: string = 'Owner';
const baseURIKey: string = 'baseURI';
const initCounter: u64 = 0;

/**
 *The NFT's main characteristics
 */

const name: string = 'MASSA_NFT';
const symbol: string = 'NFT';
const maxSupply: string = '10000';
const baseURI: string = 'massa.net/nft/';

/**
 * Increment the NFT counter
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function increment(_: string): string {
    const add1: u32 = 1;
    const incr = u32(parseInt(Storage.get(counterKey))) + add1;
    Storage.set(counterKey, incr.toString());
    return '';
}

/**
 * Init the NFT with name, symbol, maxsupply and baseURI,
 * init the counter to 0, the owner of the contract,
 * the "ledger" of owner of token IDs ,
 * then create key value for each.
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function setNFT(_: string): string {
    if (!Storage.has(counterKey)) {
        Storage.set(baseURIKey, baseURI);
        Storage.set(ownerKey, Context.caller()._value);
        Storage.set(counterKey, initCounter.toString());
        generateEvent(
            `${name} with symbol  ${symbol} and total supply of  ${maxSupply} is well setted`
        );
    }
    return '';
}

/**
 * Return the NFT's name
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function Name(_: string): string {
    return name;
}
/**
 * Return the NFT's symbol
 *  * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function Symbol(_: string): string {
    return symbol;
}

/**
 * Return the token URI (external link written in NFT where pictures or others a stored)
 * @param {string} tokenId
 * @return {string}
 */

export function TokenURI(tokenId: string): string {
    return baseURI + tokenId;
}

/**
 * Return base URI
 ** @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function BaseURI(_: string): string {
    return baseURI;
}

/**
 * Return the max supply possible
 ** @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function LimitSupply(_: string): string {
    return maxSupply;
}

/**
 * Return the current counter, if 10 NFT minted, returns '10'.
 *  * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * * @return {string}
 */

export function CurrentSupply(_: string): string {
    return Storage.get(counterKey);
}
/**
 *
 * Return true if the caller is the creator of the SC
 *  * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *  * @return {bool}
 */

export function OnlyOwner(_: string): bool {
    return Context.caller()._value == Storage.get(ownerKey);
}

/**
 *
 * Return the owner of a tokenID
 * @param {u64} tokenId
 * @return {string}
 */

export function OwnerOf(tokenId: u64): string {
    return Storage.get(ownerTokenKey + tokenId.toString());
}
/**
 *
 * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
 * Check if max supply is not reached
 * @param {Address} to
 * @return {string}
 */

export function Mint(to: Address): string {
    // if (u32(parseInt(LimitSupply("_"))) >= u32(parseInt(CurrentSupply("_")))) {
    increment('_');
    const tokenID = CurrentSupply('');
    const key = ownerTokenKey + tokenID;
    Storage.set(key, to._value);
    generateEvent(`tokenId ${tokenID} minted to ${to._value} `);
    // } else {
    //     generateEvent(`Max supply reached`);
    // }
    return '';
}
/**
 *Transfer a choosen token from the caller to the to Address
 check first the caller owns the token 
 * @param {Address} to
 * @param {u64} tokenId
 * @return {void}
 */

export function Tranfer(to: Address, tokenId: u64): string {
    if (OwnerOf(tokenId) == Context.caller()._value) {
        Storage.set(ownerTokenKey + tokenId.toString(), to._value);
        generateEvent(
            `token ${tokenId.toString()} sent from ${
                Context.caller()._value
            } to ${to._value}`
        );
    } else {
        `You are not the owner of ${tokenId.toString()}`;
    }
    return '';
}
