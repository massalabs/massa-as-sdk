import {Address, call} from '../std';
import {ByteArray} from '@massalabs/as/assembly';

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
 * ...
 * ```
 */
export class NFTWrapper {
  _origin: Address;
  _name: string;
  _symbol: string;
  _baseURI: string;
  _limitSupply: string;

  /**
     * Wraps a smart contract exposing standard token FFI.
     *
     * @param {Address} at - Address of the smart contract.
     */
  constructor(at: Address) {
    this._origin = at;
    this._name = call(this._origin, 'name', '', 0);
    this._symbol = call(this._origin, 'symbol', '', 0);
    this._baseURI = call(this._origin, 'baseURI', '', 0);
    this._limitSupply = call(this._origin, 'limitSupply', '', 0);
    call(this._origin, 'setNFT', '', 0);
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
     * Return the token URI (external link written in NFT where pictures or others a stored)
     * @param {u64} tokenId
     * @return {string}
     */
  tokenURI(tokenId: u64): string {
    return this._baseURI + tokenId.toString();
  }

  /**
     * Return the base URI (external link written in NFT where pictures or others a stored)
     * @return {string}
     */
  baseURI(): string {
    return this._baseURI;
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
    return call(this._origin, 'currentSupply', '', 0);
  }

  /**
     *
     * Return the owner of a tokenID
     * @param {u64} tokenId
     * @return {string}
     */
  ownerOf(tokenId: u64): string {
    return call(this._origin, 'ownerOf', tokenId.toString(), 0);
  }

  /**
     *
     * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
     * Check if max supply is not reached
     * @param {Address} to
     * @return {string}
     */
  mint(to: Address): string {
    return call(this._origin, 'mint', to.toByteString(), 0);
  }

  /**
    *Transfer a choosen token from the caller to the to Address
    check first the caller owns the token 
    * @param {Address} to
    * @param {u64} tokenId
    * @return {void}
    */
  tranfer(to: Address, tokenId: u64): string {
    return call(
      this._origin,
      'transfer',
      to
        .toStringSegment()
        .concat(ByteArray.fromU64(tokenId).toByteString()),
      0
    );
  }
}
