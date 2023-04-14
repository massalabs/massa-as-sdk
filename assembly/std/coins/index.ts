/**
 * This namespace is used to interact with wallet's **balance** and **transfers**.
 * It is located at **std/coins**.
 *
 * @remarks
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
