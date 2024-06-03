/**
 *  Set MAS balance for a given address..
 *
 * @param address - The address to set the balance for
 *
 * @example
 * ```typescript
 * test('mocked balance', () => {
 *  const addr = 'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';
 * const balance: u64 = 123;
 * mockBalance(addr.toString(), balance);
 * const res = balanceOf(addr);
 * expect(res).toBe(balance);
 * });
 * ```
 */
@external("massa", "assembly_script_mock_balance")
export declare function mockBalance(address: string, balance: u64): void;

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
 * Set mock for call coins.
 * 
 * @deprecated
 * Use `mockTransferredCoins` instead.
 * @remarks
 * This function is used to mock the call coins value for test purpose.
 * Don't forget to reset the mock after the test.
 *
 * @example
 * ```typescript
 * test('mocked SC call', () => {
 *   const coins: u64 = 123;
 *   setCallCoins(coins);
 *   const res = transferredCoins();
 *   expect(res).toBe(coins);
 *   setCallCoins(0); // Don't forget to reset the mock

 * });
 * ```
 */
@external("massa", "assembly_script_set_call_coins")
export declare function setCallCoins(value: u64): void;

/**
 * Set mock for call coins.
 * 
 * @remarks
 * This function is used to mock the call coins value for test purpose.
 * Don't forget to reset the mock after the test.
 *
 * @example
 * ```typescript
 * test('mocked SC call', () => {
 *   const coins: u64 = 123;
 *   mockTransferredCoins(coins);
 *   const res = transferredCoins();
 *   expect(res).toBe(coins);
 *   mockTransferredCoins(0); // Don't forget to reset the mock

 * });
 * ```
 */
@external("massa", "assembly_script_set_call_coins")
export declare function mockTransferredCoins(value: u64): void;

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
 * Changes wether the testing context is
 * has all privileges or not by giving the write access to all contracts
 *
 * @remarks
 * This function is used to test write access protected smart contract functions.
 *
 * @param isAdmin - true to give write access, false otherwise
 *
 * @example
 * ```typescript
 * test('test protected function', () => {
 *   mockAdminContext(true);
 *
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   const res = myProtectedSCFunc(NoArgs.serialize());
 *
 *   expect(res).toBe(mockValue);
 * });
 * ```
 */
@external("massa", "assembly_script_mock_admin_context")
export declare function mockAdminContext(isAdmin: bool): void;

/**
 * Emulate a deployment context by giving the write access to called contract.
 * If callerAddress is not passed, uses the current call stack caller address as the caller address.
 * If callerAddress is passed, the call stack will be updated to have the given address as the caller address.
 *
 *
 * @param callerAddress - the optional caller address to use for the deployment emulation
 *
 * @example
 * ```typescript
 * test('test constructor function', () => {
 *   setDeployContext();
 *
 *   const mockValue: StaticArray<u8> = [1,2,3];
 *   const res = constructor(NoArgs.serialize());
 *
 *   expect(res).toBe(mockValue);
 * });
 * ```
 */
@external("massa", "assembly_script_set_deploy_context")
export declare function setDeployContext(callerAddress?: string): void;

/**
 * Emulate a local context by giving the write access to all contracts
 * as well a emulating a local callStack.
 *
 * @remarks
 *
 * The local emulation is done by modifying the call stack to have identical caller and callee addresses.
 *
 * If the given localAddress is not passed, uses the current contract address as the caller address.
 *
 * @param address - the optional address to use for the local emulation
 *
 */
@external("massa", "assembly_script_set_local_context")
export declare function setLocalContext(address?: string): void;

@external("massa", "assembly_script_set_chain_id")
export declare function mockSetChainId(value: number): void;

/**
 * Set mock for origin operation Id.
 *
 * @remarks
 * This function is used to mock the origin operation Id for test purpose.
 * If an empty string is passed, the origin operation Id will be reset to the default value (random generated).
 * Don't forget to reset the mock after the test.
 *
 * @example
 * ```typescript
 * test('mock origin opId', () => {
 *   const opId = 123;
 *   mockOriginOperationId(opId);
 *   const res = getOriginOperationId()();
 *   expect(res).toBe(opId);
 * });
 * ```
 */
@external("massa", "assembly_script_set_origin_operation_id")
export declare function mockOriginOperationId(opId: string): void;
