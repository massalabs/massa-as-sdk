/**
 * This namespace is used to interact with wallet's **balance** and **transfers**.
 * It is located at **coins**.
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
 * In the file **balance.ts** you can find functions to interact with the **balance** of a wallet such as:
 * - {@link balance}.
 * - {@link balanceOf}.
 *
 * In the file **transfer.ts** you can find functions to make **coins transfers** between wallets such as:
 * - {@link transferCoins}.
 * - {@link transferCoinsOf}.
 *
 * @module
 *
 */

export * from './balance';
export * from './transfer';
