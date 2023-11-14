export function staticArrayToHexString(arr: StaticArray<u8>): string {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    const hexValue = arr[i].toString(16).padStart(2, '0'); // Convert to hex and pad with zero if needed
    result += hexValue;
  }
  return result;
}

export function hexStringToStaticArray(hexString: string): StaticArray<u8> {
  let result = new StaticArray<u8>(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    let byte = parseInt(hexString.substr(i, 2), 16);
    result[i / 2] = <u8>byte;
  }

  return result;
}
