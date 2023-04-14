import { Args } from '@massalabs/as-types';
import { Address } from '../std';
import { env } from '../env';
import { mockScCall } from '../vm-mock/env';

describe('Testing vm mock functions', () => {
  it('perform a call', () => {
    // Given
    const mockedCallReturnValue: StaticArray<u8> = [1, 2, 3];
    const functionName = 'test';
    const arg = new Args();
    const at = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
    mockScCall(mockedCallReturnValue);
    // When
    const result: StaticArray<u8> = env.call(
      at.toString(),
      functionName,
      arg.serialize(),
      0,
    );
    // Then
    expect(result).toStrictEqual(mockedCallReturnValue);
  });

  it('perform a local call', () => {
    // Given
    const mockedCallReturnValue: StaticArray<u8> = [1, 2, 3];
    const functionName = 'test';
    const arg = new Args();
    const at = new Address(
      'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
    );
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
