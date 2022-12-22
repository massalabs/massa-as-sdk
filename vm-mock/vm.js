/* eslint-disable require-jsdoc */
/**
 * Addresses and callstack
 */

// Those both addresses have been randomly generated
const callerAddress = 'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const contractAddress = 'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

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

// Generates a probably invalid address of 50 base58 characters
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

/**
 * Create a mock vm to simulate calls and responses of Massa WebAssembly sdk.
 *
 * @param {WebAssembly.Memory} memory
 * @param {?} createImports
 * @param {?} instantiate
 * @param {?} binary
 *
 * @returns {?} ?
 */
export default function createMockedABI(memory, createImports, instantiate, binary) {
  function byteArrToString(arr) {
    return new TextDecoder("utf-16").decode(arr);
  };

  function ptrToString(ptr) {
    return byteArrToString(webModule.__getArrayBuffer(ptr));
  };

  function ptrToUint8ArrayString(ptr) {
    return new Uint8Array(webModule.__getArrayBuffer(ptr)).toString();
  }

  function getArrayBuffer(ptr) {
    return webModule.__getArrayBuffer(ptr);
  };

  function newArrayBuffer(buffer) {
    return webModule.__newArrayBuffer(buffer);
  };

  function newString(buffer) {
    return webModule.__newString(buffer);
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

      // map the assemblyscript file with the contractAddresses generated
      assembly_script_create_sc(_) {
        const newAddress = {_value: generateDumbAddress(), _isValid: true};
        const newAddressLedger = {
          storage: new Map(),
          contract: '',
        };
        ledger.set(newAddress._value, newAddressLedger);
        return newArrayBuffer(newAddress._value);
      },

      assembly_script_get_time(){
        return BigInt(Date.now());
      }
    },
  };

  let instance = instantiate(binary, createImports(myImports));

  instance.then(function (result) {
    webModule = result.exports;
  });

  return instance;
}
