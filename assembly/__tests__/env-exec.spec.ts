// This file is aim to test the env execution related functions which are external functions.
// For now we only simple test the functions that are not using the call stack.

import { env } from '../env';
import { Address, Context } from '../std';

const smartContractTestAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

describe('Testing env execution related functions', () => {
  test('localExecution', () => {
    expect(
      env.localExecution(new StaticArray(0), 'myFunction', new StaticArray(0)),
    ).toBeTruthy();
  });

  test('if functionExists at a specific address', () => {
    expect(
      env.functionExists(smartContractTestAddress.toString(), 'myFunction'),
    ).toBe(true);
  });

  test('remainingGas', () => {
    expect(env.remainingGas()).toBe(1000000000000000000);
  });

  test('ownedAddresses', () => {
    const callStack = Context.addressStack();
    expect(env.ownedAddresses()).toBe(
      `[ ${callStack[0].toString()} , ${callStack[1].toString()} ]`,
    );
  });

  test('sendMessage', () => {
    const callStack = Context.addressStack();

    env.sendMessage(
      callStack[1].toString(),
      'myFunction',
      0,
      100,
      0,
      100,
      1000000000000000000,
      0,
      0,
      new StaticArray(0),
      callStack[1].toString(),
      new StaticArray(0),
    );
  });
});
