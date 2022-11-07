import {Address, generateEvent} from '../std/index';
import {NFTWrapper} from './NFTWrapper';

export function main(_: string): i32 {
    const NFTAddress = new Address(
        'A12QPCVR6UFjSk4F6gr7hWUgFz5czxbYshyxoMZqiYcam7LnJihK'
    );

    const toAddress = new Address(
        'A12h7cTMMimawZ4o2yoc7hSJP5EuvrfZKePuPUjL94fNE3phvgo2'
    );

    const transferAddress = new Address(
        'A12H4qLuzCoB37C2M8txHJRgXGX5GxwN2ssqe46qBfXuK34RxvLW'
    );

    const NFT = new NFTWrapper(NFTAddress);

    const NFTName = NFT.Name();
    generateEvent(`NFTNAMES is ${NFTName}`);

    const NFTSymbol = NFT.Symbol();
    generateEvent(`NFTNAMES is ${NFTSymbol}`);

    const maxSupply = NFT.LimitSupply();
    generateEvent(`max supply is ${maxSupply}`);

    const tokenURI = NFT.TokenURI(1);
    generateEvent(`token 1 URI is : ${tokenURI}`);

    const baseURI = NFT.BaseURI();
    generateEvent(`base URI is ${baseURI}`);

    const limitSupply = NFT.LimitSupply();
    generateEvent(`max supply is ${limitSupply}}`);

    const mint = NFT.Mint(toAddress);
    generateEvent(`token minted to ${toAddress.toByteString()}, ${mint}`);

    const currentSupply = NFT.CurrentSupply();
    generateEvent(`current supply is ${currentSupply}}`);

    const ownerOf = NFT.OwnerOf(2);
    generateEvent(`owner of token 2 is ${ownerOf}`);

    const transfer = NFT.Tranfer(transferAddress, 2);
    generateEvent(`${transfer}`);

    return 0;
}
