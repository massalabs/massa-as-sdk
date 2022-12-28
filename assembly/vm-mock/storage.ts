/**
 *  Change the callstack until the next call on this function
 *
 * @param callStack - string of addresses separated by a coma
 */

@external("massa", "assembly_script_change_call_stack")
export declare function changeCallStack(callStack: string): void;

/**
 *  Reset the mocked Storage for unit tests
 */
@external("massa", "assembly_script_reset_storage")
export declare function resetStorage(): void;
