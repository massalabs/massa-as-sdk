import {Address, generateEvent} from '@massalabs/massa-as-sdk';
import {NFTWrapper} from './NFTWrapper';

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
generateEvent(`max supply is ${maxSupply}`);
const NFTOwned = NFT.OwnerIndex(AddressSelf);

generateEvent(`${AddressSelf._value} owns  ${NFTOwned.join(',')}`);
