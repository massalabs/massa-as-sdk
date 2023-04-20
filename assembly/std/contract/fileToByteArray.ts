/**
 * Convert the given file content to byteArray.
 *
 * @remarks
 * This function is dynamically replaced using the byteArray converter during the compilation.
 * @see [as-transformer](https://github.com/massalabs/as/tree/main/packages/as-transformer#file2bytearray)
 *
 * @param filePath - the file path to convert
 *
 */
export function fileToByteArray(
  filePath: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): StaticArray<u8> {
  abort('Please use transformer to dynamically include the file.');
  return [];
}
