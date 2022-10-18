export default function (memory) {
    const Storage = new Map();
    const SIZE_OFFSET = -4;
    const utf16 = new TextDecoder("utf-16le", { fatal: true });
    const getString = (ptr) => {
      const len = new Uint32Array(memory.buffer)[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
      const wtf16 = new Uint16Array(memory.buffer, ptr, len);
      return utf16.decode(wtf16);
    };
    return {
      massa: {
        memory,
        assembly_script_generate_event(string) {
          console.log("event", getString(string));
        },
  
        assembly_script_set_data_for(a_ptr, k_ptr, v_ptr) {
          const a = getString(a_ptr);
          const k = getString(k_ptr);
          const v = getString(v_ptr);
          if (!Storage.has(a)) {
            Storage.set(a, new Map());
          }
          const addressStorage = Storage.get(a);
          addressStorage.set(k, v);
          console.log("addressStrorage ", addressStorage);
        },
        assembly_script_get_data_for(a_ptr, k_ptr) {
          //   console.log("###", wasm);
          let v = "";
          let v_ptr;
          const a = getString(a_ptr);
          const k = getString(k_ptr);
          if (Storage.has(a)) {
            const addressStorage = Storage.get(a);
            if (addressStorage.has(k)) {
              v = addressStorage.get(k);
              //      v_ptr = wasm.__new(v);
            }
          }
          console.log("stored value ", v_ptr);
          return v_ptr;
        },
      },
    };
  }
  
  // let m = Object();
  
  // function createMockVm(memory, createImports, instantiateSync, binary) {
  //   let wasm;
  //   const myImports = {
  //     massa: {
  //       // Those functions will be called from an external WebAssembly module.
  //       // Head objects, such as strings, can only be accessed by reading
  //       // heap memory starting at the given pointer (X_ptr variable).
  //       //
  //       // To read the module heap, __getString function is used.
  //       //
  //       // To return a heap object, such as strings, we push first the object to
  //       // the heap and then we return the pointer.
  //       //
  //       // See assembly_script_get_data, it's read and return string.
  //       assembly_script_has_data(k_ptr) {
  //         const k = wasm.__getString(k_ptr);
  //         return k in m;
  //       },
  //       assembly_script_get_data(k_ptr) {
  //         const k = wasm.__getString(k_ptr);
  //         const v_ptr = wasm.__newString(m[k]);
  //         return v_ptr;
  //       },
  //       set_data(k_ptr, v_ptr) {
  //         const k = wasm.__getString(k_ptr);
  //         const v = wasm.__getString(v_ptr);
  //         m[k] = v;
  //       },
  //     },
  //   };
  //   let instanceImports = instantiateSync(binary, createImports(myImports));
  //   wasm = instanceImports.exports;
  
  //   return instance;
  // }
  