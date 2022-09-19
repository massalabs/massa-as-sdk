export namespace env {

    // @ts-ignore
    @external("massa", "assembly_script_print")
    export declare function print(message: string): void

    // @ts-ignore
    @external("massa", "assembly_script_call")
    export declare function call(
        address: string,
        func: string,
        param: string,
        coins: u64): string

    // @ts-ignore
    @external("massa", "assembly_script_get_remaining_gas")
    export declare function remainingGas(): u64

    // @ts-ignore
    @external("massa", "assembly_script_create_sc")
    export declare function createSC(bytecode: string): string

    // @ts-ignore
    @external("massa", "assembly_script_set_data")
    export declare function set(
        key: string,
        value: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_set_data_for")
    export declare function setOf(
        address: string,
        key: string,
        value: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_get_data")
    export declare function get(key: string): string;

    // @ts-ignore
    @external("massa", "assembly_script_get_data_for")
    export declare function getOf(
        address: string,
        key: string): string;

    // @ts-ignore
    @external("massa", "assembly_script_delete_data")
    export declare function del(key: string): void

    // @ts-ignore
    @external("massa", "assembly_script_delete_data_for")
    export declare function deleteOf(
        address: string,
        key: string): void

    // @ts-ignore
    @external("massa", "assembly_script_append_data")
    export declare function append(
        key: string,
        value: string): void

    // @ts-ignore
    @external("massa", "assembly_script_append_data_for")
    export declare function appendOf(
        address: string,
        key: string,
        value: string): void

    // @ts-ignore
    @external("massa", "assembly_script_has_data")
    export declare function has(key: string): bool;

    // @ts-ignore
    @external("massa", "assembly_script_has_data_for")
    export declare function hasOf(
        address: string,
        key: string): bool;

    // @ts-ignore
    @external("massa", "assembly_script_get_owned_addresses")
    export declare function ownedAddresses(): string;

    // @ts-ignore
    @external("massa", "assembly_script_get_call_stack")
    export declare function callStack(): string;

    // @ts-ignore
    @external("massa", "assembly_script_generate_event")
    export declare function generateEvent(event: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_transfer_coins")
    export declare function transferCoins(
        to: string, amount: u64): void;

    // @ts-ignore
    @external("massa", "assembly_script_transfer_coins_for")
    export declare function transferCoinsOf(
        from: string, to: string, amount: u64): void;

    // @ts-ignore
    @external("massa", "assembly_script_get_balance")
    export declare function balance(): u64;

    // @ts-ignore
    @external("massa", "assembly_script_get_balance_for")
    export declare function balanceOf(address: string): u64;

    // @ts-ignore
    @external("massa", "assembly_script_get_call_coins")
    export declare function callCoins(): u64;

    // @ts-ignore
    @external("massa", "assembly_script_hash")
    export declare function toBase58(data: string): string;

    // @ts-ignore
    @external("massa", "assembly_script_signature_verify")
    export declare function isSignatureValid(
        digest: string,
        signature: string,
        publicKey: string): bool;

    // @ts-ignore
    @external("massa", "assembly_script_address_from_public_key")
    export declare function publicKeyToAddress(
        publicKey: string): string;

    // @ts-ignore
    @external("massa", "assembly_script_get_time")
    export declare function time(): u64;

    // @ts-ignore
    @external("massa", "assembly_script_unsafe_random")
    export declare function unsafeRandom(): i64;

    // @ts-ignore
    @external("massa", "assembly_script_send_message")
    export declare function sendMessage(
        address: string, handler: string,
        validityStartPeriod: u64, validityStartThread: u8,
        validityEndPeriod: u64, validityEndThread: u8,
        maxGas: u64, gasPrice: u64, coins: u64,
        data: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_get_current_period")
    export declare function currentPeriod(): u64;

    // @ts-ignore
    @external("massa", "assembly_script_get_current_thread")
    export declare function currentThread(): u8;

    // @ts-ignore
    @external("massa", "assembly_script_set_bytecode")
    export declare function setBytecode(bytecode: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_set_bytecode_for")
    export declare function setBytecodeOf(
        address: string,
        bytecode: string): void;

    // @ts-ignore
    @external("massa", "assembly_script_get_op_keys")
    export declare function getOpKeys(): StaticArray<u8>;

    // @ts-ignore
    @external("massa", "assembly_script_has_op_key")
    export declare function hasOpKey(key: StaticArray<u8>): StaticArray<u8>;

    // @ts-ignore
    @external("massa", "assembly_script_get_op_data")
    export declare function getOpData(key: StaticArray<u8>): StaticArray<u8>;
}
