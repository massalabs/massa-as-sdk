/**
 *  Set mock for smartcontract call. When called multiple time, mocked values will be added in the mock stack.
 *
 * @param value - Value returned by the mocked function
 *
 *    * @example
 * ```assemblyscript
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
