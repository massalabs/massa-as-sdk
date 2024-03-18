import {
  Address,
  addAddressToLedger,
  assertIsSmartContract,
  setBytecodeOf,
} from '../..';

const validSCAddress = 'AS1uku77MYEHy3i12WeERtD2JQzeKePz5zmJjWCq6A8wWyZakccQ';
const invalidSCAddress = 'AS1uu77MYeERtD2JQzeKePz5zmJjWCq6A';
const userAddress = 'AU1UpieCqHKxzYYh47YbQEHdecMQJM5VsFMn7pS2tn37bxsfdxJ5';
const noByteAddress = 'AS1uku77MYEHy3i12WeERtD2JQzeKePz5zmJjWCq6A8wWyZakccQ';

describe('assertAddressIsSmartContract', (): void => {
  throws('for an invalid address', (): void => {
    // The address is invalid but the mock ledger doesn't know that
    // so we can still set the bytecode and we are sure it fail for the right reason
    addAddressToLedger(invalidSCAddress);
    setBytecodeOf(new Address(validSCAddress), [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

    assertIsSmartContract(invalidSCAddress);
  });

  throws('for a user address', (): void => {
    addAddressToLedger(userAddress);
    assertIsSmartContract(userAddress);
  });

  throws('for a sc address with no bytecode', (): void => {
    addAddressToLedger(noByteAddress);
    assertIsSmartContract(noByteAddress);
  });

  throws('for a sc address with bytecode empty', (): void => {
    addAddressToLedger(validSCAddress);
    setBytecodeOf(new Address(validSCAddress), []);
    assertIsSmartContract(validSCAddress);
  });

  it('should not throw for a valid smart contract address', (): void => {
    addAddressToLedger(validSCAddress);
    setBytecodeOf(new Address(validSCAddress), [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    assertIsSmartContract(validSCAddress);
  });
});
