// This file is aim to test the env execution related functions which are external functions.
// For now we only simple test the functions that are not using the call stack.

import { env } from '../env';
import { Address, Context } from '../std';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

describe('Testing env coins related functions', () => {
  test('Testing localExecution (assembly_script_local_execution)', () => {
    expect(
      env.localExecution(new StaticArray(0), 'myFunction', new StaticArray(0)),
    ).toBeTruthy();
  });

  test('Testing getBytecodeOf (assembly_script_get_bytecode_for)', () => {
    expect(env.getBytecodeOf(testAddress.toString())).toBeTruthy();
  });

  test('Testing functionExists (assembly_script_function_exists)', () => {
    expect(env.functionExists(testAddress.toString(), 'myFunction')).toBe(true);
  });

  test('Testing remainingGas (assembly_script_get_remaining_gas)', () => {
    expect(env.remainingGas()).toBe(1000000000000000000);
  });

  test('Testing ownedAddresses (assembly_script_get_owned_addresses)', () => {
    const callStack = Context.addressStack();
    expect(env.ownedAddresses()).toBe(
      `[ ${callStack[0].toString()} , ${callStack[1].toString()} ]`,
    );
  });

  test('Testing sendMessage (assembly_script_send_message)', () => {
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
