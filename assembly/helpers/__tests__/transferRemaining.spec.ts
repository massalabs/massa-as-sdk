import { transferRemaining } from '../transferRemaining';
import { balance, balanceOf } from '../../std';
import {
  changeCallStack,
  mockBalance,
  mockTransferredCoins,
  resetStorage,
} from '../../vm-mock';

const caller = 'AU12NT6c6oiYQhcXNAPRRqDudZGurJkFKcYNLPYSwYkMoEniHv8FW';

export const contractAddress =
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

export function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}

describe('transferRemaining', () => {
  beforeEach(() => {
    resetStorage();
    switchUser(caller);
  });

  // scenario:
  // Storage is freed up, so the contract has more coins than it started with
  it('Execution freed storage', () => {
    const balanceInit: u64 = 1000;
    const freedCoins = 100;
    const balanceFinal: u64 = balanceInit + freedCoins;

    mockBalance(contractAddress, balanceFinal);
    mockBalance(caller, 0);
    mockTransferredCoins(0);

    transferRemaining(balanceInit);

    expect(balanceOf(caller)).toBe(freedCoins);
    expect(balance()).toBe(balanceInit);
  });

  // scenario:
  // Storage is freed up, so the contract has more coins than it started with
  // user transfer coins to the contract
  it('Execution freed storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const freedCoins = 100;
    const sent: u64 = 200;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution + freedCoins);
    mockBalance(caller, sent);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit);

    expect(balanceOf(caller)).toBe(sent + freedCoins);
    expect(balance()).toBe(balanceBeforeExecution);
  });

  // scenario:
  // Storage is freed up, so the contract has more coins than it started with
  // user transfer coins to the contract
  // user is expected to pay some coins to the contract
  it('Execution freed storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const freedCoins = 100;
    const sent: u64 = 200;
    const callerDebit: u64 = 100;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution + freedCoins);
    mockBalance(caller, sent);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit, callerDebit);

    expect(balanceOf(caller)).toBe(sent + freedCoins - callerDebit);
    expect(balance()).toBe(balanceBeforeExecution + callerDebit);
  });

  // scenario:
  // Storage is freed up, so the contract has more coins than it started with
  // user transfer coins to the contract
  // user is expected to pay some coins to the contract
  // not enough coins are transferred
  throws('Execution freed storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const freedCoins = 100;
    const sent: u64 = 200;
    const callerDebit: u64 = 500;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution + freedCoins);
    mockBalance(caller, sent);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit, callerDebit);
  });

  // scenario:
  // Storage does not change
  it('Execution does not spent/free storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const balanceInit = balanceBeforeExecution;

    mockBalance(contractAddress, balanceBeforeExecution);
    mockBalance(caller, 0);
    mockTransferredCoins(0);

    transferRemaining(balanceInit);

    expect(balanceOf(caller)).toBe(0);
    expect(balance()).toBe(balanceBeforeExecution);
  });

  // scenario:
  // Storage does not change
  // user sent coins to the contract
  it('Execution does not spent/free storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const callerInitBalance = 300;
    const sent: u64 = 200;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution);
    mockBalance(caller, callerInitBalance);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit);

    expect(balanceOf(caller)).toBe(callerInitBalance);
    expect(balance()).toBe(balanceBeforeExecution);
  });

  // scenario:
  // Storage does not change
  // user sent coins to the contract
  // user is expected to pay some coins to the contract
  it('Execution does not spent/free storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const callerInitBalance = 900;
    const sent: u64 = 799;
    const callerDebit: u64 = 500;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution);
    mockBalance(caller, callerInitBalance);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit, callerDebit);

    expect(balanceOf(caller)).toBe(callerInitBalance - callerDebit);
    expect(balance()).toBe(balanceBeforeExecution + callerDebit);
  });

  // scenario:
  // Storage coins are spent in the contract
  // user does not sent coins
  throws('Execution spent storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const spentCoins = 333;
    const callerInitBalance = 900;

    mockBalance(contractAddress, balanceBeforeExecution - spentCoins);
    mockBalance(caller, callerInitBalance);
    mockTransferredCoins(0);

    transferRemaining(balanceBeforeExecution);
  });

  // scenario:
  // Storage coins are spent in the contract
  // user sent coins to the contract
  it('Execution spent storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const spentCoins = 333;
    const callerInitBalance = 600;
    const sent: u64 = 400;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution - spentCoins);
    mockBalance(caller, callerInitBalance);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit);

    expect(balanceOf(caller)).toBe(callerInitBalance - spentCoins);
    expect(balance()).toBe(balanceBeforeExecution);
  });

  // scenario:
  // Storage coins are spent in the contract
  // user sent coins to the contract
  // user is expected to pay some coins to the contract
  it('Execution spent storage', () => {
    const balanceBeforeExecution: u64 = 1000;
    const spentCoins = 333;
    const callerInitBalance = 2000;
    const callerDebit: u64 = 222;

    const sent: u64 = 600;
    const balanceInit = balanceBeforeExecution + sent;

    mockBalance(contractAddress, balanceBeforeExecution - spentCoins);
    mockBalance(caller, callerInitBalance);
    mockTransferredCoins(sent);

    transferRemaining(balanceInit, callerDebit);

    expect(balanceOf(caller)).toBe(
      callerInitBalance - spentCoins - callerDebit,
    );
    expect(balance()).toBe(balanceBeforeExecution + callerDebit);
  });
});
