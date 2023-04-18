/**
 *  Set mock for smartcontract call. When called multiple time, mocked values will be added in the mock stack.
 *
 * @param value - Value returned by the mocked function
 *
 * @example
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

/**
 * Emulate an admin context by giving the write access to all contracts
 *
 * @remarks
 * This function is used to test write access protected smart contract functions.
 *
 * @example
 * ```typescript
 * test('test protected function', () => {
 *   mockAdminContext();
 *
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   const res = myProtectedSCFunc(NoArgs.serialize());
 *
 *   expect(res).toBe(mockValue);
 * });
 * ```
 */
@external("massa", "assembly_script_mock_admin_context")
export declare function mockAdminContext(): void;

/**
 * Emulate a deployment context by giving the write access to all contracts
 * as well a emulating a deployment for all of them.
 *
 * @remarks
 * This function is used to test write access protected smart contract functions
 * as well as 'constructor' functions.
 *
 * @example
 * ```typescript
 * test('test constructor function', () => {
 *   mockAdminContext();
 *
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   const res = constructor(NoArgs.serialize());
 *
 *   expect(res).toBe(mockValue);
 * });
 * ```
 */
@external("massa", "assembly_script_mock_deploy_context")
export declare function mockDeployContext(): void;

/**
 * Reset the context to the default one by removing all the write access
 * and the deployment emulation.
 *
 * @example
 * ```typescript
 * test('test function protection', () => {
 *   resetContext();
 *
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   const call = (): void => {
 *      myProtectedSCFunction(NoArgs.serialize());
 *   };
 *
 *   expect(call).toThrow('You do not have the write access to this smart contract'');
 * });
 * ```
 *
 */
@external("massa", "assembly_script_reset_context")
export declare function resetContext(): void;
