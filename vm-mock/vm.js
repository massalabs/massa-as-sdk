/* eslint-disable new-cap,jsdoc/require-returns */

const { createHash } = await import('node:crypto');
import { SigningKey, hashMessage } from 'ethers';
import sha3 from 'js-sha3';

/**
 * Addresses and callstack
 */

// Those both addresses have been randomly generated
let defaultCallerAddress = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
let defaultContractAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

let mockedOriginOpId = '';

/**
 * log error and throw
 *
 * @param {string} msg error message
 */
function ERROR(msg) {
  console.log('\x1b[31m%s\x1b[0m', 'Vm-mock error: ' + msg);
  throw new Error(msg);
}

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

let callStack = defaultCallerAddress + ' , ' + defaultContractAddress;

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

let webModule;

const scCallMockStack = [];
let callCoins = 0n; // Default value, coins for a call
let spentCoins = 0n; // Coins spent during the call
let chainIdMock = 77658366n; // Default value, chain id for Buildnet

/**
 * Reset the ledger
 */
function resetLedger() {
  ledger = new Map();
  ledger.set(defaultCallerAddress, {
    storage: new Map(),
    contract: '',
    balance: 100_000n,
  });
  ledger.set(defaultContractAddress, {
    storage: new Map(),
    contract: '',
    balance: 100_000n,
  });
  callCoins = 0n;
  spentCoins = 0n;
}

/**
 *
 */
function getCaller() {
  // get first elt of callStack
  const callStackArray = callStack.split(' , ');
  if (callStackArray.length < 2) {
    ERROR(`Invalid call stack ${callStack}.`);
  }
  return callStackArray[0];
}

/**
 *
 */
function getCallee() {
  // get last elt of callStack
  const callStackArray = callStack.split(' , ');
  if (callStackArray.length < 2) {
    ERROR(`Invalid call stack ${callStack}.`);
  }
  return callStackArray[callStackArray.length - 1];
}

/**
 *
 */
function getCalleeBalance() {
  return BigInt(ledger.get(getCallee()).balance) + callCoins - spentCoins;
}

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
      const bytes = key.split(',');
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
  function isValidPrefix(address) {
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
  function isValidLength(address) {
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
          balance: BigInt(0),
        });
      },

      assembly_script_set_data(kPtr, vPtr) {
        const key = ptrToUint8ArrayString(kPtr);
        const v = getArrayBuffer(vPtr);

        const addressStorage = ledger.get(getCallee()).storage;

        addressStorage.set(key, v);
      },

      assembly_script_get_data(kPtr) {
        const key = ptrToUint8ArrayString(kPtr);

        const callee = getCallee();
        if (ledger.has(callee)) {
          const addressStorage = ledger.get(callee).storage;

          if (addressStorage.has(key)) {
            return newArrayBuffer(addressStorage.get(key));
          } else {
            ERROR('data entry not found');
          }
        } else {
          ERROR(`Address ${callee} does not exist in ledger.`);
        }
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

        const key = ptrToUint8ArrayString(kPtr);
        const v = getArrayBuffer(vPtr);

        if (!ledger.has(a)) {
          ledger.set(a, {
            storage: new Map(),
            contract: '',
            balance: BigInt(0),
          });
        }
        const addressStorage = ledger.get(a).storage;
        addressStorage.set(key, v);
      },

      assembly_script_get_data_for(aPtr, kPtr) {
        const a = ptrToString(aPtr);
        const key = ptrToUint8ArrayString(kPtr);

        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          if (addressStorage.has(key)) {
            return newArrayBuffer(addressStorage.get(key));
          } else {
            ERROR('data entry not found');
          }
        } else {
          ERROR(`Address ${a} does not exist in ledger.`);
        }
      },

      assembly_script_has_data(kPtr) {
        const key = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(getCallee()).storage;
        return addressStorage.has(key);
      },

      assembly_script_has_data_for(aPtr, kPtr) {
        const a = ptrToString(aPtr);
        const key = ptrToUint8ArrayString(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          return addressStorage.has(key);
        } else {
          return false;
        }
      },

      assembly_script_delete_data(kPtr) {
        const key = ptrToUint8ArrayString(kPtr);
        const callee = getCallee();
        if (ledger.has(callee)) {
          const addressStorage = ledger.get(callee).storage;
          if (!addressStorage.has(key)) {
            ERROR('data entry not found');
          }
          addressStorage.delete(key);
        } else {
          ERROR(`Address ${callee} does not exist in ledger.`);
        }
      },

      assembly_script_delete_data_for(addressPtr, kPtr) {
        const address = ptrToString(addressPtr);
        const key = ptrToUint8ArrayString(kPtr);

        if (!ledger.has(address)) {
          ERROR(`Address ${address} does not exist in ledger.`);
        }

        const addressStorage = ledger.get(address).storage;

        if (!addressStorage.has(key)) {
          ERROR('data entry not found');
        }

        addressStorage.delete(key);
      },

      assembly_script_append_data(kPtr, valuePtr) {
        const callee = getCallee();
        const key = ptrToUint8ArrayString(kPtr);
        const newValue = getArrayBuffer(valuePtr);

        if (!ledger.has(callee)) {
          ERROR(`Address ${callee} does not exist in ledger.`);
        }

        const addressStorage = ledger.get(callee).storage;

        if (!addressStorage.has(key)) {
          ERROR('data entry not found');
        }

        const oldValue = addressStorage.get(key);
        const concat = concatenateArrays(oldValue, newValue);

        addressStorage.set(key, concat);
      },

      assembly_script_append_data_for(addressPtr, kPtr, valuePtr) {
        const address = ptrToString(addressPtr);
        const key = ptrToUint8ArrayString(kPtr);
        const newValue = getArrayBuffer(valuePtr);

        if (!ledger.has(address)) {
          ERROR(`Address ${address} does not exist in ledger.`);
        }

        const addressStorage = ledger.get(address).storage;

        if (!addressStorage.has(key)) {
          ERROR('data entry not found');
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

        ledger.set(newAddress._value, {
          storage: new Map(),
          contract: '',
          balance: BigInt(0),
        });

        return newArrayBuffer(newAddress._value);
      },

      assembly_script_get_time() {
        return BigInt(Date.now());
      },

      assembly_script_mock_call(ptr) {
        scCallMockStack.push(getArrayBuffer(ptr));
      },

      assembly_script_call(_address, method, _param, coins) {
        if (scCallMockStack.length) {
          if(BigInt(coins) > getCalleeBalance()) {
            ERROR('Not enough balance to pay the call to ' + ptrToString(method));
          }
          spentCoins += BigInt(coins);
          return newArrayBuffer(scCallMockStack.shift());
        }
        ERROR('No mock defined for sc call on ' + ptrToString(method));
      },

      assembly_script_local_call(_address, method, _param) {
        if (scCallMockStack.length) {
          return newArrayBuffer(scCallMockStack.shift());
        }
        ERROR('No mock defined for sc call on ' + ptrToString(method));
      },

      assembly_script_mock_admin_context(isAdmin) {
        adminContext = isAdmin;
      },

      assembly_script_set_deploy_context(addrPtr) {
        adminContext = true;
        let caller = getCaller();
        if(addrPtr) {
          caller = ptrToString(addrPtr);
          if (!ledger.has(caller)) {
            // add the new address to the ledger
            ledger.set(caller, {
              storage: new Map(),
              contract: '',
              balance: BigInt(0),
            });
          }
          // updating the callStack
          callStack = caller + ' , ' + getCallee();
        }
      },

      assembly_script_set_local_context(addrPtr) {
        adminContext = true;
        let callerAddress = getCallee();
        if (addrPtr) {
          callerAddress = ptrToString(addrPtr);
          if (!ledger.has(callerAddress)) {
            ledger.set(callerAddress, {
              storage: new Map(),
              contract: '',
              balance: BigInt(0),
            });
          }
        }

        callStack = callerAddress + ' , ' + callerAddress;
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

        return isValidLength(address) && isValidPrefix(address);
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
          const prefixStr = ptrToUint8ArrayString(prefix);
          keysArr = keysArr.filter((key) => {
            return key.startsWith(prefixStr);
          });
        }
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_get_keys(prefix) {
        const addressStorage = ledger.get(getCallee()).storage;
        let keysArr = Array.from(addressStorage.keys());

        if (prefix) {
          const prefixStr = ptrToUint8ArrayString(prefix);
          keysArr = keysArr.filter((key) => {
            return key.startsWith(prefixStr);
          });
        }
        const keys = serializeKeys(keysArr);
        return newArrayBuffer(keys);
      },

      assembly_script_has_op_key(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(getCallee()).storage;

        if (!addressStorage.has(k)) return newArrayBuffer();

        return newArrayBuffer(addressStorage.get(k));
      },

      assembly_script_get_op_keys() {
        const addressStorage = ledger.get(getCallee()).storage;
        const keysArr = Array.from(addressStorage.keys());
        const keys = serializeKeys(keysArr);

        return newArrayBuffer(keys);
      },

      assembly_script_get_op_data(kPtr) {
        const k = ptrToUint8ArrayString(kPtr);
        const addressStorage = ledger.get(getCallee()).storage;

        if (!addressStorage.has(k)) return newArrayBuffer();

        return newArrayBuffer(addressStorage.get(k));
      },

      assembly_script_set_call_coins(coinAmount) {
        const amount  = BigInt(coinAmount);
        if(amount == 0n) {
          callCoins = 0n;
          return;
        }
        const caller = ledger.get(getCaller());
        if (!caller) {
          ERROR(`Unable to add coins for contract call. Address ${getCaller()} does not exists in ledger.`);
        }

        if (caller.balance < amount) {
          ERROR(`${getCaller()} has not enough balance to pay ${amount.toString()} coins.`);
        }
        callCoins = amount;
        caller.balance -= callCoins;

      },

      assembly_script_get_call_coins() {
        return callCoins;
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
        return newString(`[ ${getCaller()} , ${getCallee()} ]`);
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
          ERROR(`Address ${address} does not exist.`);
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

        const addressLedger = ledger.get(getCallee());
        addressLedger.contract = bytecode;
      },

      assembly_script_set_bytecode_for(aPtr, bytecodePtr) {
        const a = ptrToString(aPtr);
        const bytecode = getArrayBuffer(bytecodePtr);

        if (!ledger.has(a)) {
          ERROR(`Address ${a} does not exist in ledger.`);
        }

        const addressLedger = ledger.get(a);
        addressLedger.contract = bytecode;
      },

      assembly_script_get_bytecode() {
        const addressLedger = ledger.get(getCallee());
        return newArrayBuffer(addressLedger.contract);
      },

      assembly_script_get_bytecode_for(aPtr) {
        const a = ptrToString(aPtr);
        if (!ledger.has(a)) {
          ERROR(`Address ${a} does not exist in ledger.`);
        }

        const addressLedger = ledger.get(a);
        return newArrayBuffer(addressLedger.contract);
      },

      assembly_script_transfer_coins(addressPtr, amount) {
        const toAddress = ptrToString(addressPtr);

        if (!ledger.has(toAddress)) {
          ledger.set(toAddress, {
            storage: new Map(),
            contract: '',
            balance: BigInt(0),
          });
        }
        if (ledger.get(toAddress).balance === undefined) {
          ledger.get(toAddress).balance = BigInt(0);
        }

        const fromAddress = getCallee();
        if (!ledger.has(fromAddress)) {
          ERROR(`Sending address ${fromAddress} does not exist in ledger.`);
        }

        const senderBalance = getCalleeBalance();
        if (senderBalance == undefined || senderBalance < BigInt(amount)) {
          ERROR('Not enough balance to transfer ' + amount + ' coins.');
        }

        ledger.get(toAddress).balance += BigInt(amount);
        ledger.get(fromAddress).balance -= BigInt(amount);
      },

      assembly_script_transfer_coins_for(
        _addressFromPtr,
        _addressToPtr,
        _coinsAmount,
      ) {
        const addressFrom = ptrToString(_addressFromPtr);
        const addressTo = ptrToString(_addressToPtr);

        if (!ledger.has(addressFrom)) {
          ERROR(`Sending address ${addressFrom} does not exist in ledger.`);
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
          ERROR(`not enough balance to transfer ${_coinsAmount} coins.`);
        }

        ledger.get(addressFrom).balance -= BigInt(_coinsAmount);
        ledger.get(addressTo).balance += BigInt(_coinsAmount);
      },

      assembly_script_mock_balance(aPtr, amount) {
        const addr = ptrToString(aPtr);
        if (!ledger.has(addr)) {
          ledger.set(addr, {
            storage: new Map(),
            contract: '',
            balance: BigInt(amount),
          });
          return;
        }
        ledger.get(addr).balance = BigInt(amount);
      },

      assembly_script_get_balance() {
        return getCalleeBalance();
      },

      assembly_script_get_balance_for(aPtr) {
        const addr = ptrToString(aPtr);
        if (!ledger.has(addr)) return 0n;

        if(addr === getCallee()) {
          return getCalleeBalance();
        }
        return ledger.get(addr).balance;
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
          ERROR('Invalid signature length. Expected 65 bytes');
        }

        const pubKeyBuf = getArrayBuffer(publicKeyPtr);
        if (pubKeyBuf.byteLength !== 64) {
          ERROR(
            'Invalid public key length. Expected 64 bytes uncompressed secp256k1 public key',
          );
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
          ERROR('Invalid signature length. Expected 65 bytes');
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

      assembly_script_set_origin_operation_id(dataPtr) {
        const opId = ptrToString(dataPtr);
        mockedOriginOpId = opId;
      },

      assembly_script_get_origin_operation_id() {
        if (mockedOriginOpId !== '') {
          return newString(mockedOriginOpId);
        }
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
