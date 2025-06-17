import { bn254 } from '@noble/curves/bn254.js';
import sha3 from 'js-sha3';

// Constants matching the Rust implementation
const ROUNDS = 110;
const EXPONENT = 5n;
const BLOCK_SIZE = 32;

/**
 * Convert big endian bytes to field element
 * 
 * @param {Uint8Array} bytes - A byte array of length 32
 * @returns {bigint} The bn254 field element from the bytes
 */
function bytesToFieldElement(bytes) {
  return bn254.fields.Fr.fromBytes(bytes);
}


/**
 * Convert field element to big endian bytes
 * 
 * @param {bigint} fieldElement - The bn254 field element
 * @returns {Uint8Array} A byte array of length 32
 */
function fieldElementToBytes(fieldElement) {
  return bn254.fields.Fr.toBytes(fieldElement);
}


/**
 * Generate round constants
 * 
 * @param {number} rounds - The number of rounds constants to generate
 * @returns {bigint[]} The round constants as an array of bn254 field elements
 */
function generateRoundConstants(rounds = ROUNDS) {
  const SEED = Buffer.from('seed');
  const roundConstants = [];
    
  // First hash of seed
  let rnd = Buffer.from(sha3.keccak256.arrayBuffer(SEED));
    
  // Pre-hash before use
    
  // Generate round constants
  for (let i = 0; i < rounds; i++) {
    rnd = Buffer.from(sha3.keccak256.arrayBuffer(rnd));
    const rc = bn254.fields.Fr.fromBytes(rnd);
    roundConstants.push(rc);
  }
    
  return roundConstants;
}

/**
 * MiMC hash function using bn254 field elements
 * 
 * @param {Uint8Array} bytes - Input data as a byte array, either less than 32 bytes or a multiple of 32 bytes
 * @returns {Uint8Array} The hash as a byte array of length 32
 */
function hashMimc(bytes) {
  bytes = Uint8Array.from(Buffer.from(bytes));

  if (bytes.length % BLOCK_SIZE !== 0 && bytes.length > BLOCK_SIZE) {
    throw new Error('Input length must be less than 32 or a multiple of 32');
  }
  if (bytes.length > 64 * BLOCK_SIZE) {
    throw new Error('Input length must be less than 2048');
  }

  // Convert input bytes to field elements
  const dataElements = [];
  if (bytes.length > 0) {
    if (bytes.length < BLOCK_SIZE) {
      // For inputs smaller than 32 bytes, left-pad with 0s
      const paddedInput = new Uint8Array(BLOCK_SIZE);
      paddedInput.set(bytes, BLOCK_SIZE - bytes.length);
      const elem = bytesToFieldElement(paddedInput);
      dataElements.push(elem);
    } else {
      // Process each 32-byte chunk
      for (let i = 0; i < bytes.length; i += BLOCK_SIZE) {
        const chunk = bytes.slice(i, i + BLOCK_SIZE);
        if (chunk.length !== BLOCK_SIZE) {
          throw new Error('chunk length is not 32');
        }
        const elem = bytesToFieldElement(chunk);
        // Verify conversion (like in Rust)
        if (fieldElementToBytes(elem).toString() !== chunk.toString()) {
          throw new Error('Cannot convert into field element');
        }
        dataElements.push(elem);
      }
    }
  }
    
  // Generate round constants
  const roundConstants = generateRoundConstants(ROUNDS);
    
  // Initialize hash state
  let h = bn254.fields.Fr.ZERO;
    
  // Process each data element
  for (const dataElem of dataElements) {
    // Do the ROUNDS rounds of MiMC
    let m = dataElem;
    for (let i = 0; i < ROUNDS; i++) {
      // m = (m + h + constant)^5
      m = bn254.fields.Fr.add(m, h);
      m = bn254.fields.Fr.add(m, roundConstants[i]);
      m = bn254.fields.Fr.pow(m, EXPONENT);
    }
    m = bn254.fields.Fr.add(m, h); // final addition of key

    // Miyaguchi-Preneel: h = encrypt(data_elem) + h + data_elem
    h = bn254.fields.Fr.add(m, h);
    h = bn254.fields.Fr.add(h, dataElem);
  }
    
  // Convert result to bytes (big-endian)
  return fieldElementToBytes(h);
}

export { hashMimc };