/**
 *  Change the callstack until the next call on this function
 *
 * @param {string} callStack - string of addresses separated by a coma
 *
 * @returns {void}
 */

@external("massa", "assembly_script_change_call_stack")
export declare function changeCallStack(callStack: string): void;

/**
 *  Reset the mocked Storage for unittests
 *
 * @returns {void}
 */
@external("massa", "assembly_script_reset_storage")
export declare function resetStorage(): void;
