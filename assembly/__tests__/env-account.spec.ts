import { Address } from '../std';
import { changeCallStack, resetStorage } from '../vm-mock/storage';
import { Args, bytesToString, stringToBytes } from '@massalabs/as-types';
import { env } from '../env/index';

describe('Testing mocked account related functions', () => {
  test('assembly_script_signature_verify', () => {
    const digest = 'digest';
    const signature = 'signature';
    const publicKey = 'pubKey';
    expect(env.isSignatureValid(digest, signature, publicKey)).toBe(true);
  });

  test('assembly_script_address_from_public_key', () => {
    const publicKey = 'publicKey';
    expect(env.publicKeyToAddress(publicKey)).toBe(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
  });
});
