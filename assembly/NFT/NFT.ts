///////////////////////////////
////////////////////////////
////////////////////////
// WIP allowance, and transferFrom Missing
////////////////////////
////////////////////////////
///////////////////////////////

import {Address, Storage, Context, generateEvent} from '../std';
import {ByteArray} from '@massalabs/as/assembly';
const ownerTokenKey: string = 'ownerOf_';
const counterKey: string = 'Counter';
const ownerKey: string = 'Owner';
const baseURIKey: string = 'baseURI';
const initCounter: u64 = 0;

/**
 *The NFT's main characteristics
 */

const _name: string = 'MASSA_NFT';
const _symbol: string = 'NFT';
const _maxSupply: string = '10000';
const _baseURI: string = 'massa.net/nft/';

/**
 * Init the NFT with name, symbol, maxsupply and baseURI,
 *
 * init the counter to 0, the owner of the contract,
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *
 * @return {string}
 */
export function setNFT(_: string): string {
  if (!Storage.has(counterKey)) {
    Storage.set(baseURIKey, _baseURI);
    Storage.set(ownerKey, Context.caller().toByteString());
    Storage.set(counterKey, initCounter.toString());
    generateEvent(
      `${name} with symbol ${_symbol} and total supply of ${_maxSupply} is well setted`,
    );
  } else {
    generateEvent(`NFT already setted`);
  }
  return '';
}

/**
 * Change the base URI, can be only called by the contract Owner
 * @param {string} newBaseURI new link include in the NFTs
 * @return {string}
 */
export function setURI(newBaseURI: string): string {
  if (_onlyOwner('')) {
    Storage.set(baseURIKey, newBaseURI);
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
export function name(_: string): string {
  return _name;
}
/**
 * Return the NFT's symbol
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function symbol(_: string): string {
  return _symbol;
}

/**
 * Return the token URI (external link written in NFT where pictures or others a stored)
 * @param {string} tokenId
 * @return {string}
 */
export function tokenURI(tokenId: string): string {
  if (Storage.has(baseURIKey)) {
    return Storage.get(baseURIKey) + tokenId;
  } else {
    generateEvent(`NFT not setted yet`);
    return '';
  }
}

/**
 * Return base URI
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function baseURI(_: string): string {
  if (Storage.has(baseURIKey)) {
    return Storage.get(baseURIKey);
  } else {
    generateEvent(`NFT not setted yet`);
    return '';
  }
}

/**
 * Return the max supply possible
 *@param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function limitSupply(_: string): string {
  return _maxSupply;
}

/**
 * Return the current counter, if 10 NFT minted, returns '10'.
 *  @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *  @return {string}
 */
export function currentSupply(_: string): string {
  if (Storage.has(counterKey)) {
    return Storage.get(counterKey);
  } else {
    generateEvent(`NFT not setted yet`);
    return '';
  }
}

/**
 *
 * Return the tokenId's owner
 * @param {string} tokenId
 * @return {string}
 */
export function ownerOf(tokenId: string): string {
  if (Storage.has(ownerTokenKey + tokenId.toString())) {
    return Storage.get(ownerTokenKey + tokenId.toString());
  } else {
    generateEvent(`NFT not minted yet`);
    return '';
  }
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
export function mint(args: string): string {
  if (u32(parseInt(limitSupply(''))) > u32(parseInt(currentSupply('')))) {
    const addr = Address.fromByteString(args);
    _increment('');
    const tokenID: string = currentSupply('');
    const key = ownerTokenKey + tokenID;
    Storage.set(key, addr.toByteString());
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
  const incr = u32(parseInt(Storage.get(counterKey))) ++;
  Storage.set(counterKey, incr.toString());
  return '';
}

/**
 *
 * Return true if the caller is the creator of the SC
 *   @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 *   @return {bool}
 */
function _onlyOwner(_: string): bool {
  return Context.caller().toByteString() == Storage.get(ownerKey);
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
export function transfer(args: string): string {
  const toAddress = new Address();
  const offset = toAddress.fromStringSegment(args);

  const tokenId: u64 = ByteArray.fromByteString(args.substr(offset, 8)).toU64();
  if (!Storage.has(ownerTokenKey + tokenId.toString())) {
    generateEvent(`token ${tokenId.toString()} not yet minted`);
    return '';
  }
  if (ownerOf(tokenId.toString()) == Context.caller().toByteString()) {
    Storage.set(ownerTokenKey + tokenId.toString(), toAddress.toByteString());
    generateEvent(
      `token ${tokenId.toString()} sent from ${Context.caller().toByteString()} to ${toAddress.toByteString()}`,
    );
  } else {
    generateEvent(`You are not the owner of ${tokenId.toString()}`);
  }
  return '';
}
