// XXX : Is it used?

/**
 * Set data in mocked storage
 *
 * Set the given value for the given key in mocked vm storage.
 *
 * @param {string} k - Key to set the data to.
 * @param {string} v - Value to set in storage.
 *
 * @returns {void}
 */
// @ts-ignore: decorator
@external("massa-sc-std", "set")
export declare function setData(k: StaticArray<u8>, v: StaticArray<u8>): void;

/**
 *  Change the callstack until the next call on this function
 *
 *
 * @param {string} callStack - string of addresses separated by a coma
 *
 * @returns {void}
 */
// @ts-ignore: decorator
@external("massa", "assembly_script_change_call_stack")
export declare function changeCallStack(callStack: string): void;

/**
 *  Reset the mocked Storage for unittests
 *
 * @returns {void}
 */
// @ts-ignore: decorator
@external("massa", "assembly_script_reset_storage")
export declare function resetStorage(): void;
