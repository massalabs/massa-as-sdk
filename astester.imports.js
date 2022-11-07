let exports;

export function setExports(xpt) {
    exports = xpt;
}

export function local(memory) {
    const Storage = new Map();
    const SIZE_OFFSET = -4;
    const utf16 = new TextDecoder('utf-16le', {fatal: true});

    const getString = (ptr) => {
        const len =
            new Uint32Array(memory.buffer)[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
        const wtf16 = new Uint16Array(memory.buffer, ptr, len);
        return utf16.decode(wtf16);
    };

    //from assemblyscript/loader/index
    function newString(str) {
        if (str == null) return 0;
        const length = str.length;
        const ptr = exports.__new(length << 1, 1);
        const U16 = new Uint16Array(memory.buffer);
        for (var i = 0, p = ptr >>> 1; i < length; ++i)
            U16[p + i] = str.charCodeAt(i);
        return ptr;
    }

    return {
        massa: {
            memory,
            assembly_script_generate_event(string) {
                console.log('event', getString(string));
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
            },
            assembly_script_get_data_for(a_ptr, k_ptr) {
                let v = '';
                const a = getString(a_ptr);
                const k = getString(k_ptr);
                if (Storage.has(a)) {
                    const addressStorage = Storage.get(a);
                    if (addressStorage.has(k)) {
                        v = addressStorage.get(k);
                    }
                }
                return newString(v);
            },
        },
    };
}
