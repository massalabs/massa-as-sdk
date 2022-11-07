///////////////////////////////
////////////////////////////
////////////////////////
// WIP allowance, and transferFrom Missing
////////////////////////
////////////////////////////
///////////////////////////////

// as astester.imports.js for the
//  moment only contents setOf, getOf and generateEvent,
// this NFT_fortest contract has been modificated in consequences
// original contract kept commented to further implementation

import {Address, Storage, Context, generateEvent} from '../std';
import {ByteArray} from '@massalabs/as/assembly';
const ownerTokenKey: string = 'ownerOf_';
const counterKey: string = 'Counter';
const ownerKey: string = 'Owner';
const baseURIKey: string = 'baseURI';
const initCounter: u64 = 0;

const ofAddress = new Address('0x');
const OwnerAddress = new Address('9x');

/**
 *The NFT's main characteristics
 */

const name: string = 'MASSA_NFT';
const symbol: string = 'NFT';
const maxSupply: string = '3';
const baseURI: string = 'massa.net/nft/';

/**
 * Init the NFT with name, symbol, maxsupply and baseURI,
 * init the counter to 0, the owner of the contract,
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */

export function setNFT(_: string): string {
    //  if (!Storage.has(counterKey)) {
    Storage.setOf(ofAddress, baseURIKey, baseURI);
    Storage.setOf(ofAddress, ownerKey, OwnerAddress.toByteString());
    Storage.setOf(ofAddress, counterKey, initCounter.toString());
    generateEvent(
        `${name} with symbol  ${symbol} and total supply of  ${maxSupply} is well setted`
    );
    // } else {
    //     generateEvent(`NFT already setted`);
    // }
    return '';
}

/**
 * Change the base URI, can be only called by the contract Owner
 * @param {string} newBaseURI new link include in the NFTs
 * @return {string}
 */

export function SetURI(newBaseURI: string): string {
    if (_OnlyOwner('')) {
        Storage.setOf(ofAddress, baseURIKey, newBaseURI);
        generateEvent(`new base URI ${newBaseURI} well setted`);
    } else {
        generateEvent(`you are not the contract Owner`);
    }
    return '';
}

// ======================================================== //
// ====                 TOKEN ATTIBUTES                ==== //
// ======================================================== //

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
    // if (Storage.hasOf(ofAddress, counterKey)) {
    return Storage.getOf(ofAddress, counterKey);
    // } else {
    //     generateEvent(`NFT not setted yet`);
    //     return "";
    // }
}

/**
 *
 * Return the tokenId's owner
 * @param {string} tokenId
 * @return {string}
 */

export function OwnerOf(tokenId: string): string {
    // if (Storage.hasOf(ofAddress, ownerTokenKey + tokenId.toString())) {
    return Storage.getOf(ofAddress, ownerTokenKey + tokenId.toString());
    // } else {
    //     generateEvent(`NFT not minted yet`);
    //     return "";
    // }
}

// ==================================================== //
// ====                 TRANSFER                   ==== //
// ==================================================== //
/**
 *
 * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
 * Check if max supply is not reached
 * @param {string} args - byte string containing an owner's account (Address).
 * @return {string}
 */

export function Mint(args: string): string {
    if (u32(parseInt(LimitSupply(''))) > u32(parseInt(CurrentSupply('')))) {
        const addr = Address.fromByteString(args);
        _increment('');
        const tokenID: string = CurrentSupply('');
        const key = ownerTokenKey + tokenID;
        Storage.setOf(ofAddress, key, addr.toByteString());
        generateEvent(`tokenId ${tokenID} minted to ${addr.toByteString()} `);
    } else {
        generateEvent(`Max supply reached`);
    }
    return 'Minted';
}

/**
 * Increment the NFT counter
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
function _increment(_: string): string {
    const add1: u32 = 1;
    const incr = u32(parseInt(Storage.getOf(ofAddress, counterKey))) + add1;
    Storage.setOf(ofAddress, counterKey, incr.toString());
    return '';
}

/**
 *
 * Return true if the caller is the creator of the SC
 *  * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *  * @return {bool}
 */

//always true for test
function _OnlyOwner(_: string): bool {
    return '9x' == Storage.getOf(ofAddress, ownerKey);
}

// ==================================================== //
// ====                 TRANSFER                   ==== //
// ==================================================== //

/**
 *Transfer a choosen token from the caller to the to Address
 check first the caller owns the token and if token minted
 * @param {string} args - byte string with the following format:
 * - the recipient's account (address)
 * - the tokenID (u64).
 * @return {string}
 */

export function Transfer(args: string): string {
    const toAddress = new Address();
    const offset = toAddress.fromStringSegment(args);

    const tokenId: u64 = ByteArray.fromByteString(
        args.substr(offset, 8)
    ).toU64();
    // if (!Storage.hasOf(ofAddress, ownerTokenKey + tokenId.toString())) {
    //     generateEvent(`token ${tokenId.toString()} not yet minted`);
    //     return "";
    // }
    // if (OwnerOf(tokenId.toString()) == Context.caller().toByteString()) {
    Storage.setOf(
        ofAddress,
        ownerTokenKey + tokenId.toString(),
        toAddress.toByteString()
    );
    generateEvent(
        `token ${tokenId.toString()} sent from you to ${toAddress.toByteString()}`
    );
    // } else {
    //     generateEvent(`You are not the owner of ${tokenId.toString()}`);
    // }
    return '';
}
