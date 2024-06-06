export function staticArrayToUint8Array(
  staticArray: StaticArray<u8>,
): Uint8Array {
  let uint8Array = new Uint8Array(staticArray.length);

  for (let i = 0; i < staticArray.length; i++) {
    uint8Array[i] = staticArray[i];
  }

  return uint8Array;
}
