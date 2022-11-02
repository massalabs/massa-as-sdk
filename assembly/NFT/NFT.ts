///////////////////////////////
////////////////////////////
////////////////////////
// WIP allowance, and transferFrom Missing
////////////////////////
////////////////////////////
///////////////////////////////

import {Address, Storage, Context, generateEvent} from '../std';
const ownersKey: string = 'Owners';
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
 *Init an array containing the owner of each tokenId
 * for instance if maxSupply = 3 => ["", 1 , "", 2, "", 3]
 */

const arrOwners: Array<string> = new Array<string>(
    2 * u32(parseInt(maxSupply))
);
for (let i = 0; i < arrOwners.length; ++i) {
    arrOwners[i] = '';
}
let j = 1;
for (let i = 1; i < arrOwners.length; i += 2) {
    arrOwners[i] = j.toString();
    j++;
}
/**
 * Increment the NFT counter
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

function increment(_: string): void {
    const incr = u64(parseInt(Storage.get(counterKey))) + 1;
    Storage.set(counterKey, incr.toString());
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
    //   assert(Storage.has(counterKey), "NFT already setted");
    Storage.set(baseURIKey, baseURI);
    // Storage.set(ownerKey, Context.caller()._value);
    Storage.set(ownersKey, arrOwners.toString());
    Storage.set(counterKey, initCounter.toString());
    generateEvent(
        `${name} with symbol  ${symbol} and total supply of  ${maxSupply} is well setted`
    );
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
 * Return a string array containing all the tokenIDs with all the owners
 *  * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *  * @return {string}
 */

export function CheckLedger(_: string): string {
    return Storage.get(ownersKey);
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
 * Return a string of array with all tokenIDs owned by an address
 * @param {Addresse} address
 * @return {string}
 */

export function OwnerIndex(address: Address): string {
    const arrRaw = CheckLedger('').split(',');
    const indexes: Array<u64> = [];
    for (let i = 0; i < arrRaw.length; i++)
        if (arrRaw[i] === address._value) indexes.push(i + 1);
    return indexes.join(',');
}

/**
 *
 * Return the owner of a tokenID
 * @param {u64} tokenId
 * @return {string}
 */

export function OwnerOf(tokenId: u64): string {
    const arrRaw = CheckLedger('_').split(',');
    const OwnerIndex = arrRaw.indexOf(tokenId.toString()) - 1;
    return arrRaw[OwnerIndex];
}

/**
 *
 * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
 * Check if max supply is not reached
 * @param {Address} to
 * @return {void}
 */

export function Mint(to: Address): void {
    assert(
        u32(parseInt(LimitSupply('_'))) >= u32(parseInt(CurrentSupply('_'))),
        'Limit supply reached'
    );
    const arrRaw = CheckLedger('_').split(',');
    arrRaw[u32(parseInt(CurrentSupply('_')) * 2)] = to._value;
    Storage.set(ownersKey, arrRaw.join(','));
    increment('_');
    generateEvent(`tokenId ${CurrentSupply('_')} minted to ${to._value} `);
}

/**
 *Transfer a choosen token from the caller to the to Address
 check first the caller owns the token 
 * @param {Address} to
 * @param {u64} tokenId
 * @return {void}
 */

export function Tranfer(to: Address, tokenId: u64): void {
    assert(
        OwnerOf(tokenId) == Context.caller()._value,
        `You are not the owner of ${tokenId.toString()}`
    );
    const arrRaw = CheckLedger('_').split(',');
    arrRaw[arrRaw.indexOf(tokenId.toString()) - 1] = to._value;
    Storage.set(ownersKey, arrRaw.join(','));
    generateEvent(
        `token ${tokenId.toString()} sent from ${Context.caller()._value} to ${
            to._value
        }`
    );
}
