export function staticArrayToHexString(arr: StaticArray<u8>): string {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    const hexValue = arr[i].toString(16).padStart(2, '0'); // Convert to hex and pad with zero if needed
    result += hexValue;
  }
  return result;
}
