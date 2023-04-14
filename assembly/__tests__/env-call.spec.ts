import { Args } from '@massalabs/as-types';
import { Address } from '../std';
import { env } from '../env';
import { mockScCall } from '../vm-mock/env';

describe('Testing vm mock functions', () => {
  it('perform a local call', () => {
    const mockedCallReturnValue: StaticArray<u8> = [1, 2, 3];
    const functionName = 'test';
    const arg = new Args();
    const at = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );

    // Given
    // See mockScCall documentation for more details
    mockScCall(mockedCallReturnValue);
    // When
    const result: StaticArray<u8> = env.localCall(
      at.toString(),
      functionName,
      arg.serialize(),
    );
    // Then
    expect(result).toStrictEqual(mockedCallReturnValue);
  });
});
