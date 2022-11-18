import {Address, call, Args} from '../std';
import {ByteArray} from '@massalabs/as/assembly';
import {NoArg} from '../std/arguments';

/**
 * The Massa's standard NFT implementation wrapper.
 *
 * This class can be used to wrap a smart contract implementing
 * Massa standard NFT.
 * All the serialization/deserialization will handled here.
 *
 * ```assemblyscript
 *  ...
 *  const coin = new NFTWrapper(sc_address);
 *  const coinName = coin.Name();
 *  ...
 * ```
 */
export class NFTWrapper {
  _origin: Address;
  _name: string;
  _symbol: string;
  _limitSupply: string;

  /**
   * Wraps a smart contract exposing standard token FFI.
   *
   * @param {Address} at - Address of the smart contract.
   */
  constructor(at: Address) {
    this._origin = at;
    this._name = call(this._origin, 'name', NoArg, 0);
    this._symbol = call(this._origin, 'symbol', NoArg, 0);
    this._limitSupply = call(this._origin, 'limitSupply', NoArg, 0);
    call(this._origin, 'setNFT', NoArg, 0);
  }

  /**
   * Return the NFT's name
   * @return {string}
   */
  name(): string {
    return this._name;
  }
  /**
   * Return the NFT's symbol
   * @return {string}
   */
  symbol(): string {
    return this._symbol;
  }

  /**
   * Return the token URI (external link written in NFT where pictures or others are stored)
   * @param {u64} tokenId
   * @return {string}
   */
  tokenURI(_args: string): string {
    const args = new Args(_args);
    const tokenId = args.nextU64();

    return call(this._origin, 'baseURI', NoArg, 0) + tokenId.toString();
  }

  /**
   * Return the base URI (external link written in NFT where pictures or others a stored)
   * @return {string}
   */
  baseURI(): string {
    return call(this._origin, 'baseURI', NoArg, 0);
  }

  /**
   * Return the max supply
   * @return {string}
   */
  limitSupply(): string {
    return this._limitSupply;
  }

  /**
   * Return the current counter, if 10 NFT minted, returns 10.
   * @return {u64}
   */
  currentSupply(): string {
    return call(this._origin, 'currentSupply', NoArg, 0);
  }

  /**
   * Return the owner of a tokenID
   * @param {u64} tokenId
   * @return {string}
   */
  ownerOf(_args: string): string {
    return call(this._origin, 'ownerOf', new Args(_args), 0);
  }

  /**
   * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
   * Check if max supply is not reached
   * @param {Address} to
   * @return {string}
   */
  mint(_args: string): string {
    return call(this._origin, 'mint', new Args(_args), 0);
  }

  /**
   * Transfer a chosen token from the caller to the to Address.
   * Check first the caller owns the token.
   * @param {Address} to
   * @param {u64} tokenId
   * @return {void}
   */
  transfer(_args: string): string {
    return call(this._origin, 'transfer', new Args(_args), 0);
  }
}
