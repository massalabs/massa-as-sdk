import {Address, generateEvent} from '../std/index';
import {NFTWrapper} from './NFTWrapper';

export function main(_: string): i32 {
    const NFTAddress = new Address(
        'A12UputbUPoKQUwTfqGXYiM2uWY6LVfUbNZGSarUq8GVN5NqFUyz'
    );

    // const AddressSelf = new Address(
    //     "A12h7cTMMimawZ4o2yoc7hSJP5EuvrfZKePuPUjL94fNE3phvgo2"
    // );

    const NFT = new NFTWrapper(NFTAddress);

    const NFTName = NFT.Name();
    generateEvent(`NFTNAMES is ${NFTName}`);

    const maxSupply = NFT.LimitSupply();
    generateEvent(`max supply is ${maxSupply}`);
    // const NFTOwned = NFT.OwnerIndex(AddressSelf);

    // generateEvent(`${AddressSelf._value} owns  ${NFTOwned.join(",")}`);

    return 0;
}
