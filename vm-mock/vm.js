const { createHash } = await import('node:crypto');
import { SigningKey, hashMessage } from 'ethers';
import sha3 from 'js-sha3';

/**
 * Addresses and callstack
 */

// Those both addresses have been randomly generated
let callerAddress = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
let contractAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

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
export function generateDumbAddress() {
  return 'A12' + mixRandomChars(47);
}

/**
 * Generates a random operationId.
 *
 * @returns {string} a random operationId
 */
export function generateRandOpId() {
  return 'O1' + mixRandomChars(47);
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
        "Balance" : "100000
    }
}
*/
let ledger;
let adminContext = false;
let deployContext = false;

/**
 * Reset the ledger
 */
function resetLedger() {
  ledger = new Map();
  ledger.set(callerAddress, {
    storage: new Map(),
    contract: '',
    balance: BigInt(100000),
  });
  ledger.set(contractAddress, {
    storage: new Map(),
    contract: '',
    balance: BigInt(100000),
  });
}

let webModule;

const scCallMockStack = [];
let chainIdMock = BigInt(77658366); // Default value, chain id for Buildnet

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

  /**
   * Check if the address prefix is valid
   *
   * @param {string} address - the address to check
   * @returns {boolean} - true if the address prefix is valid
   */
  function isRightPrefix(address) {
    const addressPrefix = 'A';
    const addressPrefixUserOrSC = ['U', 'S'];
    return (
      address.startsWith(addressPrefix) &&
      addressPrefixUserOrSC.includes(address[1])
    );
  }

  /**
   * Check if the address length is valid
   *
   * @param {string} address - the address to check
   * @returns {boolean} - true if the address length is valid
   */
  function isRightLength(address) {
    const minAddressLength = 40;
    const maxAddressLength = 60;
    return (
      address.length >= minAddressLength && address.length <= maxAddressLength
    );
  }

  /**
   * Concatenate two arrays
   *
   * @param {ArrayBuffer} array1 - The first array
   * @param {ArrayBuffer} array2 - The second array
   * @returns {Uint8Array} - The concatenated array
   */
  function concatenateArrays(array1, array2) {
    const totalLength = array1.byteLength + array2.byteLength;
    const result = new Uint8Array(totalLength);
    result.set(new Uint8Array(array1), 0);
    result.set(new Uint8Array(array2), array1.byteLength);
    return result;
  }

  resetLedger();

  const myImports = {
    massa: {
      memory,

      assembly_script_add_address_to_ledger(addressPtr) {
        const address = ptrToString(addressPtr);
        ledger.set(address, {
          storage: new Map(),
          contract: '',
        });
      },

      assembly_script_set_data(kPtr, vPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const v = getArrayBuffer(vPtr);

        const addressStorage = ledger.get(contractAddress).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);

        if (ledger.has(contractAddress)) {
          const addressStorage = ledger.get(contractAddress).storage;

          if (addressStorage.has(k)) {
            return newArrayBuffer(addressStorage.get(k));
          } else {
            throw new Error('Runtime error: data entry not found');
          }
        } else {
          throw new Error(
            'Runtime error: address parsing error: ' + contractAddress,
          );
        }
      },

      assembly_script_reset_storage() {
        resetLedger();
      },

      assembly_script_change_call_stack(callstackPtr) {
        callStack = ptrToString(callstackPtr);
        callerAddress = callStack.split(' , ')[0];
        contractAddress =
          callStack.split(' , ').length > 1 ? callStack.split(' , ')[1] : '';
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
            return newArrayBuffer(addressStorage.get(k));
          } else {
            throw new Error('Runtime error: data entry not found');
          }
        } else {
          throw new Error('Runtime error: address parsing error: ' + a);
        }
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
          if (!addressStorage.has(k)) {
            throw new Error('Runtime error: data entry not found');
          }
          addressStorage.delete(k);
        } else {
          throw new Error(
            'Runtime error: address parsing error: ' + contractAddress,
          );
        }
      },

      assembly_script_delete_data_for(addressPtr, keyPtr) {
        const address = ptrToString(addressPtr);
        const key = ptrToUint8ArrayString(keyPtr);

        if (!ledger.has(address)) {
          throw new Error('Runtime error: address parsing error: ' + address);
        }

        const addressStorage = ledger.get(address).storage;

        if (!addressStorage.has(key)) {
          throw new Error('Runtime error: data entry not found');
        }

        addressStorage.delete(key);
      },

      assembly_script_append_data(keyPtr, valuePtr) {
        const address = contractAddress;
        const key = ptrToUint8ArrayString(keyPtr);
        const newValue = getArrayBuffer(valuePtr);

        if (!ledger.has(address)) {
          throw new Error('Runtime error: address parsing error: ' + address);
        }

        const addressStorage = ledger.get(address).storage;

        if (!addressStorage.has(key)) {
          throw new Error('Runtime error: data entry not found');
        }

        const oldValue = addressStorage.get(key);
        const concat = concatenateArrays(oldValue, newValue);

        addressStorage.set(key, concat);
      },

      assembly_script_append_data_for(addressPtr, keyPtr, valuePtr) {
        const address = ptrToString(addressPtr);
        const key = ptrToUint8ArrayString(keyPtr);
        const newValue = getArrayBuffer(valuePtr);

        if (!ledger.has(address)) {
          throw new Error('Runtime error: address parsing error: ' + address);
        }

        const addressStorage = ledger.get(address).storage;

        if (!addressStorage.has(key)) {
          throw new Error('Runtime error: data entry not found');
        }

        const oldValue = addressStorage.get(key);
        const concat = concatenateArrays(oldValue, newValue);

        addressStorage.set(key, concat);
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

      assembly_script_local_call(_address, method, _param) {
        if (scCallMockStack.length) {
          return newArrayBuffer(scCallMockStack.shift());
        }
        throw new Error(
          `No mock defined for sc call on "${ptrToString(method)}".`,
        );
      },

      assembly_script_mock_admin_context(isAdmin) {
        adminContext = isAdmin;
      },

      assembly_script_mock_not_admin_context() {
        adminContext = false;
      },

      assembly_script_set_deploy_context(addrPtr) {
        adminContext = true;
        // Ensure the caller address is different from the contract address
        if (!addrPtr || ptrToString(addrPtr) === contractAddress) {
          // generate a new address if it is the same as the contract address
          callerAddress = generateDumbAddress();
        } else {
          callerAddress = ptrToString(addrPtr);
        }

        if (!ledger.has(callerAddress)) {
          // add the new address to the ledger
          ledger.set(callerAddress, {
            storage: new Map(),
            contract: '',
          });
        }
        // updating the callStack
        callStack = callerAddress + ' , ' + contractAddress;
      },

      assembly_script_set_local_context(addrPtr) {
        adminContext = true;
        if (!addrPtr) {
          // if the address is not set, uses the current contract address as caller address
          callerAddress = contractAddress;
        } else {
          callerAddress = ptrToString(addrPtr);
          contractAddress = callerAddress;
        }
        if (!ledger.has(callerAddress)) {
          ledger.set(callerAddress, {
            storage: new Map(),
            contract: '',
          });
        }
        callStack = callerAddress + ' , ' + contractAddress;
      },

      assembly_script_caller_has_write_access() {
        return adminContext; // uses the saved actual state of the context
      },

      assembly_script_hash_sha256(aPtr) {
        const data = getArrayBuffer(aPtr);
        const hash = createHash('sha256').update(new Uint8Array(data)).digest();
        return newArrayBuffer(hash);
      },

      assembly_script_validate_address(addressPtr) {
        const address = ptrToString(addressPtr);

        return isRightLength(address) && isRightPrefix(address);
      },

      assembly_script_print(aPtr) {
        const a = ptrToString(aPtr);
        console.log(a);
      },

      assembly_script_get_keys_for(aPtr, prefix) {
        const a = ptrToString(aPtr);
        if (!ledger.has(a)) return newArrayBuffer('');

        const addressStorage = ledger.get(a).storage;
        let keysArr = Array.from(addressStorage.keys());
        if (prefix) {
          keysArr = keysArr.filter((key) => {
            const prefixStr = ptrToUint8ArrayString(prefix);
            return key.startsWith(prefixStr);
          });
        }
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_get_keys(prefix) {
        const addressStorage = ledger.get(contractAddress).storage;
        let keysArr = Array.from(addressStorage.keys());

        if (prefix) {
          keysArr = keysArr.filter((key) => {
            const prefixStr = ptrToUint8ArrayString(prefix);
            return key.startsWith(prefixStr);
          });
        }
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

      assembly_script_get_current_period() {
        return BigInt(0);
      },

      assembly_script_get_current_thread() {
        return 1;
      },

      assembly_script_set_bytecode(bytecodePtr) {
        const bytecode = getArrayBuffer(bytecodePtr);

        const addressLedger = ledger.get(contractAddress);
        addressLedger.contract = bytecode;
      },

      assembly_script_set_bytecode_for(aPtr, bytecodePtr) {
        const a = ptrToString(aPtr);
        const bytecode = getArrayBuffer(bytecodePtr);

        if (!ledger.has(a)) {
          throw new Error('Runtime error: address parsing error: ' + a);
        }

        const addressLedger = ledger.get(a);
        addressLedger.contract = bytecode;
      },

      assembly_script_get_bytecode() {
        const addressLedger = ledger.get(contractAddress);
        return newArrayBuffer(addressLedger.contract);
      },

      assembly_script_get_bytecode_for(aPtr) {
        const a = ptrToString(aPtr);
        if (!ledger.has(a)) {
          throw new Error('Runtime error: address parsing error: ' + a);
        }

        const addressLedger = ledger.get(a);
        return newArrayBuffer(addressLedger.contract);
      },

      assembly_script_transfer_coins(_addressPtr, _coinsAmount) {
        const address = ptrToString(_addressPtr);
        if (!ledger.has(address)) {
          ledger.set(address, {
            storage: new Map(),
            contract: '',
            balance: BigInt(0),
          });
        }
        const callerBalance = ledger.get(callerAddress).balance;
        if (callerBalance < BigInt(_coinsAmount)) {
          throw new Error(
            `Runtime error: not enough balance to transfer ${_coinsAmount} coins.`,
          );
        }
        ledger.get(callerAddress).balance -= BigInt(_coinsAmount);
        ledger.get(address).balance += BigInt(_coinsAmount);
      },

      assembly_script_transfer_coins_for(
        _addressFromPtr,
        _addressToPtr,
        _coinsAmount,
      ) {
        const addressFrom = ptrToString(_addressFromPtr);
        const addressTo = ptrToString(_addressToPtr);

        if (!ledger.has(addressFrom)) {
          throw new Error(
            'Runtime error: address parsing error: ' + addressFrom,
          );
        }

        if (!ledger.has(addressTo)) {
          ledger.set(addressTo, {
            storage: new Map(),
            contract: '',
            balance: BigInt(0),
          });
        }

        const addressFromBalance = ledger.get(addressFrom).balance;

        if (addressFromBalance < BigInt(_coinsAmount)) {
          throw new Error(
            `Runtime error: not enough balance to transfer ${_coinsAmount} coins.`,
          );
        }

        ledger.get(addressFrom).balance -= BigInt(_coinsAmount);
        ledger.get(addressTo).balance += BigInt(_coinsAmount);
      },

      assembly_script_get_balance() {
        return BigInt(ledger.get(contractAddress).balance);
      },

      assembly_script_get_balance_for(aPtr) {
        const a = ptrToString(aPtr);
        if (!ledger.has(a)) return BigInt(0);

        return BigInt(ledger.get(a).balance);
      },

      assembly_script_signature_verify(digestPtr, signaturePtr, publicKeyPtr) {
        return true;
      },

      assembly_script_evm_signature_verify(
        dataPtr,
        signaturePtr,
        publicKeyPtr,
      ) {
        const signatureBuf = getArrayBuffer(signaturePtr);
        if (signatureBuf.byteLength !== 65) {
          console.log('Invalid signature length. Expected 65 bytes');
          throw new Error();
        }

        const pubKeyBuf = getArrayBuffer(publicKeyPtr);
        if (pubKeyBuf.byteLength !== 64) {
          console.log(
            'Invalid public key length. Expected 64 bytes uncompressed secp256k1 public key',
          );
          throw new Error();
        }

        const digest = hashMessage(new Uint8Array(getArrayBuffer(dataPtr)));
        const signature = '0x' + Buffer.from(signatureBuf).toString('hex');
        const recovered = SigningKey.recoverPublicKey(digest, signature);

        const publicKey =
          '0x' +
          '04' /* compression header*/ +
          Buffer.from(pubKeyBuf).toString('hex');
        return recovered === publicKey;
      },

      assembly_script_evm_get_pubkey_from_signature(dataPtr, signaturePtr) {
        const signatureBuf = getArrayBuffer(signaturePtr);
        if (signatureBuf.byteLength !== 65) {
          console.log('Invalid signature length. Expected 65 bytes');
          throw new Error();
        }
        const digest =
          '0x' + Buffer.from(getArrayBuffer(dataPtr)).toString('hex');

        const signature = '0x' + Buffer.from(signatureBuf).toString('hex');

        const recovered = SigningKey.recoverPublicKey(digest, signature);

        return newArrayBuffer(Buffer.from(recovered.substring(2), 'hex'));
      },

      assembly_script_address_from_public_key(publicKeyPtr) {
        return newString(
          'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
        );
      },

      assembly_script_get_origin_operation_id() {
        return newString(generateRandOpId());
      },

      assembly_script_keccak256_hash(dataPtr) {
        const data = getArrayBuffer(dataPtr);
        const hash = sha3.keccak256.arrayBuffer(data);
        return newArrayBuffer(hash);
      },
      assembly_script_set_chain_id(value) {
        chainIdMock = BigInt(value);
      },
      assembly_script_chain_id() {
        return chainIdMock;
      },
    },
  };

  let instance = instantiate(binary, createImports(myImports));

  instance.then(function (result) {
    webModule = result.exports;
  });

  return instance;
}
