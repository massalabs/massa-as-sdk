let exports;

export function setExports(xpt) {
  exports = xpt;
}

function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateAddress() {
  return 'A12' + makeid(47);
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
export async function local(memory) {
  const emptyAddress = {
    storage: new Map(),
    contract: '',
  };
  const defaultAddress = 'A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';

  const Ledger = new Map();
  Ledger.set(defaultAddress, emptyAddress);

  const SIZE_OFFSET = -4;
  const utf16 = new TextDecoder('utf-16le', {fatal: true});

  const getString = (ptr) => {
    const len = new Uint32Array(memory.buffer)[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
    const wtf16 = new Uint16Array(memory.buffer, ptr, len);
    return utf16.decode(wtf16);
  };

  // from assemblyscript/loader/index
  function newString(str) {
    if (str == null) return 0;
    const length = str.length;
    const ptr = exports.__new(length << 1, 1);
    const U16 = new Uint16Array(memory.buffer);
    for (let i = 0, p = ptr >>> 1; i < length; ++i)
      U16[p + i] = str.charCodeAt(i);
    console.log(ptr);
    return ptr;
  }

  return {
    massa: {
      memory,
      assembly_script_generate_event(string) {
        console.log('event', getString(string));
      },

      assembly_script_set_data(k_ptr, v_ptr) {
        const k = getString(k_ptr);
        const v = getString(v_ptr);
        const addressStorage = Ledger.get(defaultAddress).storage;
        addressStorage.set(k, v);
      },

      assembly_script_set_data_for(a_ptr, k_ptr, v_ptr) {
        const a = getString(a_ptr);
        const k = getString(k_ptr);
        const v = getString(v_ptr);
        if (!Ledger.has(a)) {
          Ledger.set(a, emptyAddress);
        }

        const addressStorage = Ledger.get(a).storage;
        addressStorage.set(k, v);
      },

      assembly_script_get_data(k_ptr) {
        let v = '';
        const k = getString(k_ptr);
        if (Ledger.has(defaultAddress)) {
          const addressStorage = Ledger.get(defaultAddress).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return newString(v);
      },

      assembly_script_get_data_for(a_ptr, k_ptr) {
        let v = '';
        const a = getString(a_ptr);
        const k = getString(k_ptr);
        if (Ledger.has(a)) {
          const addressStorage = Ledger.get(a).storage;
          if (addressStorage.has(k)) {
            v = addressStorage.get(k);
          }
        }
        return newString(v);
      },

      assembly_script_has_data(k_ptr) {
        const k = getString(k_ptr);
        const addressStorage = Ledger.get(defaultAddress).storage;
        return addressStorage.has(k);
      },

      assembly_script_has_data_for(a_ptr, k_ptr) {
        const a = getString(a_ptr);
        const k = getString(k_ptr);
        if (Ledger.has(a)) {
          const addressStorage = Ledger.get(a).storage;
          return addressStorage.has(k);
        } else {
          return false;
        }
      },

      assembly_script_get_call_stack() {
        const [_, contractAddress] = Ledger.keys();
        return newString(
          '[ ' + defaultAddress + ' , ' + contractAddress + ' ]',
        );
      },

      assembly_script_unsafe_random() {
        return BigInt(
          Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
        );
      },

      // Here we get directly the path of the assemblyscript file as a trick
      assembly_script_create_sc(path_ptr) {
        const path = getString(path_ptr);
        const newAddress = {_value: generateAddress(), _isValid: true};
        const newAddressLedger = {
          storage: new Map(),
          contract: path,
        };
        Ledger.set(newAddress._value, newAddressLedger);
        return newString(newAddress._value);
      },
    },
  };
}
