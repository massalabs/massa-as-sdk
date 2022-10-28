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
let arrOwners: Array<string>;

export class NFTWrapper {
    _origin: Address;
    _name: string;
    _symbol: string;
    _maxSupply: u32;
    _baseURI: string;

    /**
     * Wraps a smart contract exposing standard token FFI.
     *
     * @param {Address} at - Address of the smart contract.
     */
    constructor(at: Address) {
        this._origin = at;
        this._name = call(this._origin, 'Name', '', 0);
        this._symbol = call(this._origin, 'Symbol', '', 0);
        this._maxSupply = u32(parseInt(call(this._origin, 'Symbol', '', 0)));
        this._baseURI = call(this._origin, 'BaseURI', '', 0);
        arrOwners = new Array<string>(this._maxSupply * 2);
        for (let i = 0; i < arrOwners.length; ++i) {
            arrOwners[i] = '';
        }
        let j = 1;
        for (let i = 1; i < arrOwners.length; i += 2) {
            arrOwners[i] = j.toString();
            j++;
        }
        call(
            this._origin,
            'setNFT',
            `${this._name},${this._symbol}, ${this._maxSupply.toString()}, ${
                this._baseURI
            }`,
            0
        );
    }

    /**
     * Return the NFT's name
     * @return {string}
     */

    Name(): string {
        return this._name;
    }
    /**
     * Return the NFT's symbol
     * @return {string}
     */

    Symbol(): string {
        return this._symbol;
    }

    /**
     * Return the token URI (external link written in NFT where pictures or others a stored)
     * @param {u64} tokenId
     * @return {string}
     */

    TokenURI(tokenId: u64): string {
        return call(this._origin, 'TokenURI', tokenId.toString(), 0);
    }

    /**
     * Return the token URI (external link written in NFT where pictures or others a stored)
     * @param {u64} tokenId
     * @return {string}
     */

    LimitSupply(): u64 {
        return u64(parseInt(call(this._origin, 'LimitSupply', '', 0)));
    }

    /**
     * Return the current counter, if 10 NFT minted, returns 10.
     * * @return {u64}
     */

    CurrentSupply(): u64 {
        return u64(parseInt(call(this._origin, 'CurrentSupply', '', 0)));
    }

    /**
     *
     * Return a string array containing all the tokenIDs with all the owners
     *  * @return {Array<string>}
     */

    CheckLedger(): Array<string> {
        return call(this._origin, 'CheckLedger', '', 0).split(',');
    }

    /**
     *
     * Return an array with all tokenIDs owned by an address
     * @param {Addresse} address
     * @return {Array<u64>}
     */

    OwnerIndex(address: Address): Array<u64> {
        let arrOfNum: Array<u64> = [0];
        const strArr = call(
            this._origin,
            'OwnerIndex',
            address._value,
            0
        ).split(',');

        arrOfNum = strArr.map<u64>(function (item): u64 {
            return u64(parseInt(item));
        });

        return arrOfNum;
    }

    /**
     *
     * Return the owner of a tokenID
     * @param {u64} tokenId
     * @return {string}
     */

    OwnerOf(tokenId: u64): string {
        return call(this._origin, 'OwnerOf', tokenId.toString(), 0);
    }

    /**
     *
     * The to address becomes the owner of the next token (if current tokenID = 10, will mint 11 )
     * Check if max supply is not reached
     * @param {Address} to
     * @return {void}
     */

    Mint(to: Address): void {
        call(this._origin, 'Mint', to._value, 0);
    }

    /**
   *Transfer a choosen token from the caller to the to Address
   check first the caller owns the token 
   * @param {Address} to
   * @param {u64} tokenId
   * @return {void}
   */

    Tranfer(to: Address, tokenId: u64): void {
        call(
            this._origin,
            'Transfer',
            to._value.concat(ByteArray.fromU64(tokenId).toByteString()),
            0
        );
    }
}
