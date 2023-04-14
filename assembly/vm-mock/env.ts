/**
 *  Set mock for smartcontract call. When called multiple time, mocked values will be added in the mock stack.
 *
 * @param value - Value returned by the mocked function
 *
 *    * @example
 * ```typescript
 * test('mocked SC call', () => {
 *    const addr = new Address(
 *     'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
 *   );
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   mockScCall(mockValue);
 *   const res = call(addr, 'someFunc', NoArg, 0);
 *   expect(res).toBe(mockValue);
 * });
 * ```
 */
@external("massa", "assembly_script_mock_call")
export declare function mockScCall(value: StaticArray<u8>): void;

/**
 * Add a new smart contract address to the ledger
 *
 * @remarks
 * This function is used to add a new smart contract address to the ledger for test purpose.
 * It's only used by the vm-mock.
 *
 * @param address - the address to add to the ledger
 */
@external("massa", "assembly_script_add_address_to_ledger")
export declare function addAddressToLedger(address: string): void;
