///////////////////////////////
////////////////////////////
////////////////////////
// WIP allowance, and transferFrom Missing
////////////////////////
////////////////////////////
///////////////////////////////

import {Storage, Context, generateEvent, Args} from '../std/index';
const ownerTokenKey: string = 'ownerOf_';
const counterKey: string = 'Counter';
const ownerKey: string = 'Owner';
const baseURIKey: string = 'baseURI';
const initCounter: u64 = 0;

/**
 * The NFT's main characteristics
 */

const _name: string = 'MASSA_NFT';
const _symbol: string = 'NFT';
const _maxSupply: string = '10000';
const _baseURI: string = 'massa.net/nft/';

/**
 * Init the NFT with name, symbol, maxSupply and baseURI,
 * init the counter to 0, the owner of the contract.
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
      `${_name} with symbol ${_symbol} and total supply of ${_maxSupply} is well setted`,
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
export function setURI(_args: string): string {
  const args = new Args(_args);
  const newBaseURI = args.nextString();

  if (_onlyOwner('')) {
    Storage.set(baseURIKey, newBaseURI);
    generateEvent(`new base URI ${newBaseURI} well setted`);
  } else {
    generateEvent(`you are not the contract Owner`);
  }
  return '';
}

// ======================================================== //
// ====                 TOKEN ATTRIBUTES                ==== //
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
 * Return the token URI (external link written in NFT where pictures or others are stored)
 * @param {string} tokenId
 * @return {string}
 */
export function tokenURI(_args: string): string {
  const args = new Args(_args);
  const tokenId = args.nextU64();

  if (Storage.has(baseURIKey)) {
    return Storage.get(baseURIKey) + tokenId.toString();
  } else {
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
    return '';
  }
}

/**
 * Return the max supply possible
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function limitSupply(_: string): string {
  return _maxSupply;
}

/**
 * Return the current counter, if 10 NFT minted, returns '10'.
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {string}
 */
export function currentSupply(_: string): string {
  if (Storage.has(counterKey)) {
    return Storage.get(counterKey);
  } else {
    return '';
  }
}

/**
 * Return the tokenId's owner
 * @param {string} tokenId
 * @return {string}
 */
export function ownerOf(_args: string): string {
  const args = new Args(_args);
  const tokenId = args.nextU64();

  if (Storage.has(ownerTokenKey + tokenId.toString())) {
    return Storage.get(ownerTokenKey + tokenId.toString());
  } else {
    return '';
  }
}

// ==================================================== //
// ====                 TRANSFER                   ==== //
// ==================================================== //

/**
 * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
 * Check if max supply is not reached
 * @param {string} args - byte string containing an owner's account (Address).
 * @return {string}
 */
export function mint(_args: string): string {
  if (u32(parseInt(limitSupply(''))) > u32(parseInt(currentSupply('')))) {
    const args = new Args(_args);
    const addr = args.nextAddress();
    _increment();
    const tokenID: string = currentSupply('');
    const key = ownerTokenKey + tokenID;
    Storage.set(key, addr.toByteString());
    generateEvent(`tokenId ${tokenID} minted to ${addr.toByteString()} `);
  } else {
    generateEvent(`Max supply reached`);
  }
  return '';
}

/**
 * Increment the NFT counter
 * @return {string}
 */
function _increment(): string {
  const add1: u32 = 1;
  const incr = u32(parseInt(Storage.get(counterKey))) + add1;
  Storage.set(counterKey, incr.toString());
  return '';
}

/**
 * Return true if the caller is the creator of the SC
 * @param {string} _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
 * @return {bool}
 */
function _onlyOwner(_: string): bool {
  return Context.caller().toByteString() == Storage.get(ownerKey);
}

/**
 * Return true if the caller is token's owner
 * @param {u64} tokenId the tokenID
 * @return {bool}
 */
function _onlyTokenOwner(tokenId: u64): bool {
  const argsOwnerOf = new Args().add(tokenId).serialize();
  return ownerOf(argsOwnerOf) == Context.caller().toByteString();
}

// ==================================================== //
// ====                 TRANSFER                   ==== //
// ==================================================== //

/**
 * Transfer a chosen token from the caller to the to Address.
 * Check first the caller owns the token and if token minted.
 * @param {string} args - byte string with the following format:
 * - the recipient's account (address)
 * - the tokenID (u64).
 * @return {string}
 */
export function transfer(_args: string): string {
  const args = new Args(_args);
  const toAddress = args.nextAddress();
  const tokenId = args.nextU64();
  if (!Storage.has(ownerTokenKey + tokenId.toString())) {
    generateEvent(`not minted`);
    generateEvent(`token ${tokenId.toString()} not yet minted`);
    return '';
  }
  if (_onlyTokenOwner(tokenId)) {
    generateEvent(`minted`);
    Storage.set(ownerTokenKey + tokenId.toString(), toAddress.toByteString());
    generateEvent(
      `token ${tokenId.toString()} sent from ${Context.caller().toByteString()} to ${toAddress.toByteString()}`,
    );
  } else {
    generateEvent(`You are not the owner of ${tokenId.toString()}`);
  }
  return '';
}
