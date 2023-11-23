/**
 * Retrieves the number of keys from serialized keys array
 *
 * @param arr - Uint8Array keys array
 *
 * @returns The number of keys in the keys array
 *
 */
function getNumberOfKeys(keysSer: StaticArray<u8>): u32 {
  // check if keysSer is more than 4 bytes
  assert(keysSer.length >= 4, 'Invalid keysSer length');
  // The first 4 bytes of the input array represent the number of keys
  let arr = new Uint8Array(4);
  arr[0] = keysSer[0];
  arr[1] = keysSer[1];
  arr[2] = keysSer[2];
  arr[3] = keysSer[3];
  let dv = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  let entryCount = dv.getUint32(0, true /* littleEndian */);
  return entryCount;
}

/**
 * Deserializes an array of keys from the specified serialized format.
 *
 * @param keysSer - The serialized keys.
 *
 * @returns The deserialized keys.
 *
 * @remarks
 * 'keysSer' is a encoded array of keys. Each elements are encoded as follows:
 * ```text
 *|---------------|-----------|---------------|-----------------------------------------|
 *| Field         | Type      | Size in Bytes | Description                             |
 *|---------------|-----------|---------------|-----------------------------------------|
 *| L             | u32       | 4             | Total number of keys in the sequence.   |
 *| Key1_L        | u8        | 1             | Length of the Key number 1.             |
 *| Key1          | u8[Key1_L]| Variable      | The Key number 1.                       |
 *| Key2_L        | u8        | 1             | Length of the Key number 2.             |
 *| Key2          | u8[Key2_L]| Variable      | The Key number 2.                       |
 *| ...           |           |               | Data for additional keys (if any).      |
 *|---------------|-----------|---------------|-----------------------------------------|
 * ```
 * Then it returns an array of keys:
 * ```text
 * keys = [Key1, Key2, ...]
 * ```
 *
 */
export function derKeys(keysSer: StaticArray<u8>): Array<StaticArray<u8>> {
  // check if keysSer is more than 4 bytes (for the number of keys)
  if (keysSer.length < 4) return [];

  const keyCount: u32 = getNumberOfKeys(keysSer);
  const keys = new Array<StaticArray<u8>>(keyCount);

  let cursor = 4;

  for (let i: u32 = 0; i < keyCount; i++) {
    const keyLen = keysSer[cursor];
    const start = cursor + 1;
    const end = start + keyLen;

    keys[i] = keysSer.slice<StaticArray<u8>>(start, end);

    cursor = end;
  }
  return keys;
}
