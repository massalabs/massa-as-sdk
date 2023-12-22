export namespace env {
  @external("massa", "assembly_script_print")
  export declare function print(message: string): void;

  @external("massa", "assembly_script_call")
  export declare function call(
    address: string,
    func: string,
    param: StaticArray<u8>,
    coins: u64,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_local_call")
  export declare function localCall(
    address: string,
    func: string,
    param: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_local_execution")
  export declare function localExecution(
    bytecode: StaticArray<u8>,
    func: string,
    param: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_get_bytecode")
  export declare function getBytecode(): StaticArray<u8>;

  @external("massa", "assembly_script_get_bytecode_for")
  export declare function getBytecodeOf(address: string): StaticArray<u8>;

  @external("massa", "assembly_script_caller_has_write_access")
  export declare function callerHasWriteAccess(): bool;

  @external("massa", "assembly_script_function_exists")
  export declare function functionExists(address: string, func: string): bool;

  @external("massa", "assembly_script_get_remaining_gas")
  export declare function remainingGas(): u64;

  @external("massa", "assembly_script_create_sc")
  export declare function createSC(bytecode: StaticArray<u8>): string;

  @external("massa", "assembly_script_get_keys")
  export declare function getKeys(prefix: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_get_keys_for")
  export declare function getKeysOf(
    address: string,
    prefix: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_set_data")
  export declare function set(
    key: StaticArray<u8>,
    value: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_set_data_for")
  export declare function setOf(
    address: string,
    key: StaticArray<u8>,
    value: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_get_data")
  export declare function get(key: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_get_data_for")
  export declare function getOf(
    address: string,
    key: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_delete_data")
  export declare function del(key: StaticArray<u8>): void;

  @external("massa", "assembly_script_delete_data_for")
  export declare function deleteOf(address: string, key: StaticArray<u8>): void;

  @external("massa", "assembly_script_append_data")
  export declare function append(
    key: StaticArray<u8>,
    value: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_append_data_for")
  export declare function appendOf(
    address: string,
    key: StaticArray<u8>,
    value: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_has_data")
  export declare function has(key: StaticArray<u8>): bool;

  @external("massa", "assembly_script_has_data_for")
  export declare function hasOf(address: string, key: StaticArray<u8>): bool;

  @external("massa", "assembly_script_get_owned_addresses")
  export declare function ownedAddresses(): string;

  @external("massa", "assembly_script_get_call_stack")
  export declare function callStack(): string;

  @external("massa", "assembly_script_generate_event")
  export declare function generateEvent(event: string): void;

  @external("massa", "assembly_script_transfer_coins")
  export declare function transferCoins(to: string, amount: u64): void;

  @external("massa", "assembly_script_transfer_coins_for")
  export declare function transferCoinsOf(
    from: string,
    to: string,
    amount: u64,
  ): void;

  @external("massa", "assembly_script_get_balance")
  export declare function balance(): u64;

  @external("massa", "assembly_script_get_balance_for")
  export declare function balanceOf(address: string): u64;

  @external("massa", "assembly_script_get_call_coins")
  export declare function callCoins(): u64;

  @external("massa", "assembly_script_hash")
  export declare function blake3(bytecode: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_signature_verify")
  export declare function isSignatureValid(
    data: string,
    signature: string,
    publicKey: string,
  ): bool;

  @external("massa", "assembly_script_evm_signature_verify")
  export declare function isEvmSignatureValid(
    data: StaticArray<u8>,
    signature: StaticArray<u8>,
    publicKey: StaticArray<u8>,
  ): bool;

  @external("massa", "assembly_script_evm_get_address_from_pubkey")
  export declare function evmGetAddressFromPubkey(
    publicKey: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_evm_get_pubkey_from_signature")
  export declare function evmGetPubkeyFromSignature(
    hash: StaticArray<u8>,
    signature: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_is_address_eoa")
  export declare function isAddressEoa(address: string): bool;

  @external("massa", "assembly_script_address_from_public_key")
  export declare function publicKeyToAddress(publicKey: string): string;

  @external("massa", "assembly_script_get_time")
  export declare function time(): u64;

  @external("massa", "assembly_script_unsafe_random")
  export declare function unsafeRandom(): i64;

  @external("massa", "assembly_script_send_message")
  export declare function sendMessage(
    address: string,
    functionName: string,
    validityStartPeriod: u64,
    validityStartThread: u8,
    validityEndPeriod: u64,
    validityEndThread: u8,
    maxGas: u64,
    rawFee: u64,
    coins: u64,
    functionParams: StaticArray<u8>,
    filterAddress: string,
    filterKey: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_get_origin_operation_id")
  export declare function getOriginOperationId(): string;

  @external("massa", "assembly_script_get_current_period")
  export declare function currentPeriod(): u64;

  @external("massa", "assembly_script_get_current_thread")
  export declare function currentThread(): u8;

  @external("massa", "assembly_script_set_bytecode")
  export declare function setBytecode(bytecode: StaticArray<u8>): void;

  @external("massa", "assembly_script_set_bytecode_for")
  export declare function setBytecodeOf(
    address: string,
    bytecode: StaticArray<u8>,
  ): void;

  @external("massa", "assembly_script_get_op_keys")
  export declare function getOpKeys(): StaticArray<u8>;

  @external("massa", "assembly_script_get_op_keys_prefix")
  export declare function getOpKeysPrefix(
    prefix: StaticArray<u8>,
  ): StaticArray<u8>;

  @external("massa", "assembly_script_has_op_key")
  export declare function hasOpKey(key: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_get_op_data")
  export declare function getOpData(key: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_hash_sha256")
  export declare function sha256(bytecode: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_keccak256_hash")
  export declare function keccak256(data: StaticArray<u8>): StaticArray<u8>;

  @external("massa", "assembly_script_validate_address")
  export declare function validateAddress(address: string): bool;

  @external("massa", "assembly_script_chain_id")
  export declare function chainId(): u64;
}
