/// NEW
export function stringToUint8Array(str: string): Uint8Array {
  return Uint8Array.wrap(String.UTF8.encode(str));
}

/// NEW
/// Creates a Uint8Array from an existing Uint8Array by prepending a little-endian i32 length prefix.
export function encodeLengthPrefixed(data: Uint8Array): Uint8Array {
  const len: i32 = data.length;
  const result = new Uint8Array(4 + len);
  result[0] = len & 0xff;
  result[1] = (len >> 8) & 0xff;
  result[2] = (len >> 16) & 0xff;
  result[3] = (len >> 24) & 0xff;
  result.set(data, 4);
  return result;
}
