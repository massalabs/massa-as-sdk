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
@external("massa", "assembly_script_mock_not_admin_context")
export declare function mockNonAdminContext(): void;

/**
 * Emulate a deployment context by giving the write access to all contracts
 * as well a emulating a deployment for all of them.
 *
 * @remarks
 * By default, the context as already callStack that emulates a deployment but has not write access.
 * This function ensure that both are set.
 *
 * The deployment emulation is done by modifying the call stack to have different caller and callee addresses.
 *
 * If the given callerAddress is the same as the current contract address in the call stack,
 * it is ignored to generate a different one.
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
