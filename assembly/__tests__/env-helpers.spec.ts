// This file is aim to test the env helpers functions which are external functions.

import { env } from '../env';
import { Address } from '../std';
import { addAddressToLedger } from '../vm-mock';

const testAddress = new Address(
  'AU12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR',
);

describe('Testing env coins related functions', () => {
  test('Testing currentPeriod (assembly_script_get_current_period)', () => {
    expect(env.currentPeriod()).toBe(0);
  });

  test('Testing currentThread (assembly_script_get_current_thread)', () => {
    expect(env.currentThread()).toBe(1);
  });

  test('Testing setBytecode (assembly_script_set_bytecode)', () => {
    env.setBytecode(new StaticArray(0));
    const byteCode = env.getBytecode().toString();
    expect(byteCode).toBe('');
  });

  test('Testing setBytecodeFor (assembly_script_set_bytecode_for)', () => {
    addAddressToLedger(testAddress.toString());
    env.setBytecodeOf(testAddress.toString(), new StaticArray(0));
    const byteCode = env.getBytecodeOf(testAddress.toString()).toString();
    expect(byteCode).toBe('');
  });
});
