import {createMockedABI} from './vm.js';
export default {
  /**
   * A set of globs passed to the glob package that qualify typescript files for testing.
   */
  entries: [
    'assembly/collections/**/*.spec.ts',
    'assembly/std/**/*.spec.ts',
    'assembly/token/**/*.spec.ts',
  ],
  /**
     * A set of globs passed to the glob package that quality files to be added to each test.
     */
  include: ['assembly/**/*.include.ts'],
  /**
     * A set of regexp that will disclude source files from testing.
     */
  disclude: [/node_modules/],
  /**
     * Add your required AssemblyScript imports here.
     */
  async instantiate(memory, createImports, instantiate, binary) {
    return createMockedABI(memory, createImports, instantiate, binary);
  },
  /** Enable code coverage. */
  // coverage: ["assembly/**/*.ts"],
  /**
     * Specify if the binary wasm file should be written to the file system.
     */
  outputBinary: false,
};
