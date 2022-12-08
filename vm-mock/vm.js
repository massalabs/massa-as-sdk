/* eslint-disable require-jsdoc */
/*
XXX: Only the following ABI were tested:
 - assembly_script_get_data
 - assembly_script_set_data
*/

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

// Generates a 50 chars lengh address
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

  resetLedger();

  const myImports = {
    massa: {
      memory, // Do we need this ?

      // Tested mocked ABI

      assembly_script_set_data(kPtr, vPtr) {
        const k = new Uint8Array(webModule.__getArrayBuffer(kPtr)).toString();
        const v = webModule.__getArrayBuffer(vPtr);

        const addressStorage = ledger.get(contractAddress).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data(kPtr) {
        let v = '';
        const k = new Uint8Array(webModule.__getArrayBuffer(kPtr)).toString();

        if (ledger.has(contractAddress)) {
          const addressStorage = ledger.get(contractAddress).storage;

          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }

        return webModule.__newArrayBuffer(v);
      },

      // XXX: Untested ABI, directly migrated from as-tester

      // TODO: Please move the ABIs to the previous section once you have confirmed
      //        that they are functional.
      // This action can be done on the fly.

      assembly_script_reset_storage() {
        resetLedger();
      },

      assembly_script_change_call_stack(callstackPtr) {
        const callStackToString = webModule.__getArrayBuffer(callstackPtr);
        callStack = callStackToString;
      },

      assembly_script_generate_event(string) {
        console.log('event', webModule.__getArrayBuffer(string));
      },

      assembly_script_set_data_for(aPtr, kPtr, vPtr) {
        const a = webModule.__getArrayBuffer(aPtr);
        const k = webModule.__getArrayBuffer(kPtr);
        const v = webModule.__getArrayBuffer(vPtr);
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
        const a = webModule.__getArrayBuffer(aPtr);
        const k = webModule.__getArrayBuffer(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return webModule.__newArrayBuffer(v);
      },

      assembly_script_has_data(kPtr) {
        const k = webModule.__getArrayBuffer(kPtr);
        const addressStorage = ledger.get(contractAddress).storage;
        return addressStorage.has(k);
      },

      assembly_script_has_data_for(aPtr, kPtr) {
        const a = webModule.__getArrayBuffer(aPtr);
        const k = webModule.__getArrayBuffer(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          return addressStorage.has(k);
        } else {
          return false;
        }
      },

      assembly_script_get_call_stack() {
        return webModule.__newArrayBuffer('[ ' + callStack + ']');
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
        return webModule.__newArrayBuffer(newAddress._value);
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
