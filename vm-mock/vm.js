const { createHash } = await import('node:crypto');

/**
 * Addresses and callstack
 */

// Those both addresses have been randomly generated
const callerAddress = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const contractAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';
const addressBytesLength = 53;

/**
 * return a random string
 *
 * @param {number} length length of the string to generate
 * @returns {string} random string
 */
function mixRandomChars(length) {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Generates a probably invalid address of 50 base58 characters.
 *
 * @returns {string} a random Address
 */
function generateDumbAddress() {
  return 'A12' + mixRandomChars(47);
}

let callStack = callerAddress + ' , ' + contractAddress;

/**
 * Ledger and datastore
 */

/* Ledger format :
{
    "Address" : {
        "Storage" : {
            "key1" : "value1",
            "key2" : "value2"
        },
        "Contract" : "./pathOfTheAssemblyScriptContract",
    }
}
*/
let ledger;

/**
 * Reset the ledger
 */
function resetLedger() {
  ledger = new Map();
  ledger.set(callerAddress, {
    storage: new Map(),
    contract: '',
  });
  ledger.set(contractAddress, {
    storage: new Map(),
    contract: '',
  });
}

let webModule;

const scCallMockStack = [];

/**
 * Create a mock vm to simulate calls and responses of Massa WebAssembly sdk.
 *
 * @param {?} memory -
 * @param {?} createImports -
 * @param {?} instantiate -
 * @param {?} binary -
 * @returns {?} -
 */
export default function createMockedABI(
  memory,
  createImports,
  instantiate,
  binary,
) {
  /**
   * @param {ArrayBuffer} arr the array to decode
   * @returns {string} the decoded string
   */
  function byteArrToString(arr) {
    return new TextDecoder('utf-16').decode(arr);
  }
  /**
   * @param {ArrayBuffer} arr the array to decode
   * @returns {string} the decoded string
   */
  function byteArrToUTF8String(arr) {
    return new TextDecoder('utf-8').decode(arr);
  }

  /**
   * @param {number} ptr the pointer
   * @returns {string} the string
   */
  function ptrToString(ptr) {
    return byteArrToString(webModule.__getArrayBuffer(ptr));
  }

  /**
   * @param {number} ptr the pointer
   * @returns {string} the array
   */
  function ptrToUint8ArrayString(ptr) {
    return new Uint8Array(webModule.__getArrayBuffer(ptr)).toString();
  }

  /**
   * @param {number} ptr the pointer
   * @returns {ArrayBuffer} the buffer
   */
  function getArrayBuffer(ptr) {
    return webModule.__getArrayBuffer(ptr);
  }

  /**
   * @param {ArrayBuffer} buffer the buffer
   * @returns {number} the pointer
   */
  function newArrayBuffer(buffer) {
    return webModule.__newArrayBuffer(buffer);
  }

  /**
   * @param {ArrayBuffer} buffer the buffer
   * @returns {number} the pointer
   */
  function newString(buffer) {
    return webModule.__newString(buffer);
  }

  /**
   * @param {string} text to transform
   * @returns {Uint8Array} the array of bytes
   */
  function stringToByteArray(text) {
    return new TextEncoder().encode(text);
  }

  /**
   * Converts a number to its little-endian byte representation.
   *
   * @param {number} num - The number to convert.
   * @returns {Uint8Array} - The little-endian byte representation of the number.
   */
  function numToLittleEndianBytes(num) {
    let arr = new Uint8Array(4);
    arr[0] = num & 0xff;
    arr[1] = (num >> 8) & 0xff;
    arr[2] = (num >> 16) & 0xff;
    arr[3] = (num >> 24) & 0xff;
    return arr;
  }

  /**
   * Serializes an array of keys.
   *
   * @param {string[]} keysArr - The array of keys to serialize.
   * @returns {Uint8Array} - The serialized keys.
   */
  function serializeKeys(keysArr) {
    const serialized = [];
    const lengthBytes = numToLittleEndianBytes(keysArr.length);

    serialized.push(...lengthBytes);

    for (const key of keysArr) {
      const bytes = key.split(',').map(Number);
      serialized.push(bytes.length);
      serialized.push(...bytes);
    }

    return new Uint8Array(serialized);
  }

  resetLedger();

  const myImports = {
    massa: {
      memory,

      assembly_script_set_data(kPtr, vPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const v = getArrayBuffer(vPtr);

        const addressStorage = ledger.get(contractAddress).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data(kPtr) {
        let v = '';
        const k = ptrToUint8ArrayString(kPtr);

        if (ledger.has(contractAddress)) {
          const addressStorage = ledger.get(contractAddress).storage;

          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }

        return newArrayBuffer(v);
      },

      assembly_script_reset_storage() {
        resetLedger();
      },

      assembly_script_change_call_stack(callstackPtr) {
        callStack = ptrToString(callstackPtr);
      },

      assembly_script_generate_event(msgPtr) {
        console.log('event: ', ptrToString(msgPtr));
      },

      assembly_script_set_data_for(aPtr, kPtr, vPtr) {
        const a = ptrToString(aPtr);
        const k = ptrToUint8ArrayString(kPtr);
        const v = getArrayBuffer(vPtr);
        if (!ledger.has(a)) {
          ledger.set(a, {
            storage: new Map(),
            contract: '',
          });
        }

        const addressStorage = ledger.get(a).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data_for(aPtr, kPtr) {
        let v = '';
        const a = ptrToString(aPtr);
        const k = ptrToUint8ArrayString(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return newArrayBuffer(v);
      },

      assembly_script_has_data(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(contractAddress).storage;
        return addressStorage.has(k);
      },

      assembly_script_has_data_for(aPtr, kPtr) {
        const a = ptrToString(aPtr);
        const k = ptrToUint8ArrayString(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          return addressStorage.has(k);
        } else {
          return false;
        }
      },

      assembly_script_delete_data(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        if (ledger.has(contractAddress)) {
          const addressStorage = ledger.get(contractAddress).storage;
          if (addressStorage.has(k)) {
            addressStorage.delete(k);
          }
        }
      },

      assembly_script_get_call_stack() {
        return newString('[ ' + callStack + ' ]');
      },

      assembly_script_unsafe_random() {
        return BigInt(
          Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
        );
      },

      // map the AssemblyScript file with the contractAddresses generated
      assembly_script_create_sc(_) {
        const newAddress = { _value: generateDumbAddress(), _isValid: true };
        const newAddressLedger = {
          storage: new Map(),
          contract: '',
        };
        ledger.set(newAddress._value, newAddressLedger);
        return newArrayBuffer(newAddress._value);
      },

      assembly_script_get_time() {
        return BigInt(Date.now());
      },

      assembly_script_mock_call(ptr) {
        scCallMockStack.push(getArrayBuffer(ptr));
      },

      assembly_script_call(_address, method, _param, _coins) {
        if (scCallMockStack.length) {
          return newArrayBuffer(scCallMockStack.shift());
        }
        throw new Error(
          `No mock defined for sc call on "${ptrToString(method)}".`,
        );
      },

      assembly_script_caller_has_write_access() {
        return false;
      },

      isDeployingContract() {
        return false;
      },

      assembly_script_hash_sha256(aPtr) {
        const data = byteArrToUTF8String(getArrayBuffer(aPtr));
        const hash = createHash('sha256').update(data, 'utf8').digest('hex');

        return newArrayBuffer(stringToByteArray(hash));
      },

      assembly_script_validate_address(addressPtr) {
        const address = ptrToString(addressPtr);

        return (
          stringToByteArray(address).length === addressBytesLength &&
          (address.startsWith('AU') || address.startsWith('AS'))
        );
      },

      assembly_script_print(aPtr) {
        const a = ptrToString(aPtr);
        console.log(a);
      },

      assembly_script_get_keys_for(aPtr) {
        const a = ptrToString(aPtr);
        if (!ledger.has(a)) return newArrayBuffer('');

        const addressStorage = ledger.get(a).storage;
        const keysArr = Array.from(addressStorage.keys());
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_get_keys() {
        const addressStorage = ledger.get(contractAddress).storage;
        const keysArr = Array.from(addressStorage.keys());
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_has_op_key(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(contractAddress).storage;

        if (!addressStorage.has(k)) return newArrayBuffer();

        return newArrayBuffer(addressStorage.get(k));
      },

      assembly_script_get_op_keys() {
        const addressStorage = ledger.get(contractAddress).storage;
        const keysArr = Array.from(addressStorage.keys());
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_get_op_data(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(contractAddress).storage;

        if (!addressStorage.has(k)) return newArrayBuffer();

        return newArrayBuffer(addressStorage.get(k));
      },

      assembly_script_get_call_coins() {
        return BigInt(0);
      },

      assembly_script_local_execution() {
        return newArrayBuffer('');
      },

      assembly_script_get_bytecode_for() {
        return newArrayBuffer('');
      },

      assembly_script_function_exists() {
        return true;
      },

      assembly_script_get_remaining_gas() {
        return BigInt(1000000000000000000);
      },

      assembly_script_get_owned_addresses() {
        return newString(`[ ${callerAddress} , ${contractAddress} ]`);
      },

      assembly_script_send_message(
        addressPtr,
        handlerPtr,
        validityStartPeriod,
        validityStartThread,
        validityEndPeriod,
        validityEndThread,
        maxGas,
        rawFee,
        coins,
        dataPtr,
        filterAddressPtr,
        filterKeyPtr,
      ) {
        const address = ptrToString(addressPtr);
        const calledFunction = ptrToString(handlerPtr);

        if (!ledger.has(address)) {
          throw new Error(`Address ${ptrToString(addressPtr)} does not exist.`);
        }
        console.log(
          `sendMessage: function ${calledFunction} will be called in ${address}`,
        );
      },
    },

    // assembly_script_get_current_period
    assembly_script_get_current_period() {
      return BigInt(0);
    },

    // assembly_script_get_current_thread
    assembly_script_get_current_thread() {
      return BigInt(0);
    },

    // assembly_script_set_bytecode
    assembly_script_set_bytecode() {
      return;
    },

    // assembly_script_set_bytecode_for
    assembly_script_set_bytecode_for() {
      return;
    },
  };

  let instance = instantiate(binary, createImports(myImports));

  instance.then(function (result) {
    webModule = result.exports;
  });

  return instance;
}
