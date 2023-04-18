/**
 * This namespace is used to interact with the **operation datastore**.
 * It is located at **op-datastore**.
 *
 * @privateRemarks
 *
 * Please do not dump all your functions in this namespace.
 * Try to organize them in different files.
 *
 * If any files becomes too big, or is starting to be too specific,
 * don't hesitate to propose a new namespace.
 *
 * Here is the catalog of all functions organized by file:
 *
 * In the file **op-datastore.ts** you can find all the **datastore's** functions such as:
 * - {@link getKeys}.
 * - {@link getKeysOf}.
 * - {@link getOpKeys}.
 * - {@link getOpData}.
 * - {@link hasOpKey}.
 *
 * In the file **utils.ts** you can find all the utility functions such as:
 * - {@link derKeys}.
 * - {@link getNumberOfKeys}.
 *
 * @module
 *
 */
export * from './op-datastore';
export * from './util';
