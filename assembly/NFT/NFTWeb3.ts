import {Address, generateEvent} from '../std';
import {NFTWrapper} from './NFTWrapper';

export function main(_: string): i32 {
    const NFTAddress = new Address(
        'A1VMs6G234WojfVMjruSGW7KDri5pgyA1WTDdkVbZyhEfyLSsiE'
    );

    const AddressSelf = new Address(
        'A12h7cTMMimawZ4o2yoc7hSJP5EuvrfZKePuPUjL94fNE3phvgo2'
    );

    const NFT = new NFTWrapper(NFTAddress);

    NFT.Mint(AddressSelf);

    const NFTName = NFT.Name();

    generateEvent(`NFTNAMES is ${NFTName}`);
    const maxSupply = NFT.CurrentSupply;
    generateEvent(`max supply is ${maxSupply.toString()}`);
    const NFTOwned = NFT.OwnerIndex(AddressSelf);

    generateEvent(`${AddressSelf._value} owns  ${NFTOwned.join(',')}`);

    return 0;
}
