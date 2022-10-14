export default function (memory) {
  const Storage = new Map();
  return {
    env: {
      memory,
      abort(msg, file, line, col) {
      getString(msg)

       console.log("error", text)
      },
      log(ptr) {
       console.log("log", text)
      },
  },
  massa: {
      memory,
      assembly_script_generate_event(string) {
       console.log("event", string)
      },
      assembly_script_set_data_for(address, key, value) {
          if (!Storage.has(address)) {
              Storage.set(address, new Map());
          }
          const addressStorage = Storage.get(address);
          addressStorage.set(key, value);
      },
      assembly_script_get_data_for(address, key) {
          let value = "";
          if (Storage.has(address)) {
              const addressStorage = Storage.get(address);
              if (addressStorage.has(key)) {
                  value = addressStorage.get(key);
              }
          }
          return value;
      },
  },
  };
}
