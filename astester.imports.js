/* eslint-disable require-jsdoc */
let exports;

export function setExports(xpt) {
    exports = xpt;
}

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

// Generates a 50 char lengh address
function generateDumbAddress() {
  return 'A12' + mixRandomChars(47);
}

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
export function local(memory) {
  // Thoose both address have been generated randomly
  const callerAddress = 'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
  const contractAddress = 'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

  let callStack = callerAddress + ' , ' + contractAddress;

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
  const SIZE_OFFSET = -4;
  const utf16 = new TextDecoder('utf-16le', { fatal: true });

    const getString = (ptr) => {
        const len =
            new Uint32Array(memory.buffer)[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
        const wtf16 = new Uint16Array(memory.buffer, ptr, len);
        return utf16.decode(wtf16);
    };

  // from assemblyscript/loader/index
  function newString(str) {
    if (str == null) return 0;
    const length = str.length;
    const ptr = exports.__new(length << 1, 1);
    const U16 = new Uint16Array(memory.buffer);
    for (let i = 0, p = ptr >>> 1; i < length; ++i) {
      U16[p + i] = str.charCodeAt(i);
    }
    return ptr;
  }

  resetLedger();

  return {
    massa: {
      memory,
      assembly_script_reset_storage() {
        resetLedger();
      },
      assembly_script_change_call_stack(callstackPtr) {
        const callStackToString = getString(callstackPtr);
        callStack = callStackToString;
      },
      assembly_script_generate_event(string) {
        console.log('event', getString(string));
      },

      assembly_script_set_data(kPtr, vPtr) {
        const k = getString(kPtr);
        const v = getString(vPtr);
        const addressStorage = ledger.get(contractAddress).storage;
        addressStorage.set(k, v);
      },

      assembly_script_set_data_for(aPtr, kPtr, vPtr) {
        const a = getString(aPtr);
        const k = getString(kPtr);
        const v = getString(vPtr);
        if (!ledger.has(a)) {
          ledger.set(a, {
            storage: new Map(),
            contract: '',
          });
        }

        const addressStorage = ledger.get(a).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data(kPtr) {
        let v = '';
        const k = getString(kPtr);
        if (ledger.has(contractAddress)) {
          const addressStorage = ledger.get(contractAddress).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return newString(v);
      },

      assembly_script_get_data_for(aPtr, kPtr) {
        let v = '';
        const a = getString(aPtr);
        const k = getString(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return newString(v);
      },

      assembly_script_has_data(kPtr) {
        const k = getString(kPtr);
        const addressStorage = ledger.get(contractAddress).storage;
        return addressStorage.has(k);
      },

      assembly_script_has_data_for(aPtr, kPtr) {
        const a = getString(aPtr);
        const k = getString(kPtr);
        if (ledger.has(a)) {
          const addressStorage = ledger.get(a).storage;
          return addressStorage.has(k);
        } else {
          return false;
        }
      },

      assembly_script_get_call_stack() {
        return newString('[ ' + callStack + ']');
      },

      assembly_script_unsafe_random() {
        return BigInt(
          Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
        );
      },
      // map the assemblyscript file with the contractAddresses generated
      assembly_script_create_sc(_) {
        const newAddress = { _value: generateDumbAddress(), _isValid: true };
        const newAddressLedger = {
          storage: new Map(),
          contract: '',
        };
        ledger.set(newAddress._value, newAddressLedger);
        return newString(newAddress._value);
      },
    },
  };
}
