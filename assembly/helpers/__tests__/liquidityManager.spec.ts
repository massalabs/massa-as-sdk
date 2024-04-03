import { Address } from '../../std';
import { resetStorage } from '../../vm-mock';
import { LiquidityManager, StoragePrefixManager } from '../liquidityManager';

beforeEach(() => {
  resetStorage();
});

describe('LiquidityManager - use cases', () => {
  test('executes a basic scenario with mint, transfer, and burn operations', () => {
    const storagePrefixManager = new StoragePrefixManager();
    const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

    const user1 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    const user2 = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
    );

    liquidityManager.mint(user1, 100);
    expect(liquidityManager.getBalance(user1)).toBe(
      100,
      "User1's balance should be 100 after minting.",
    );
    expect(liquidityManager.getTotalSupply()).toBe(
      100,
      'Total supply should be 100 after minting to User1.',
    );

    liquidityManager.transfer(user1, user2, 50);
    expect(liquidityManager.getBalance(user1)).toBe(
      50,
      "User1's balance should be 50 after transferring 50 to User2.",
    );
    expect(liquidityManager.getBalance(user2)).toBe(
      50,
      "User2's balance should be 50 after receiving 50 from User1.",
    );

    liquidityManager.burn(user1, 50);
    expect(liquidityManager.getBalance(user1)).toBe(
      0,
      "User1's balance should be 0 after burning 50.",
    );
    expect(liquidityManager.getTotalSupply()).toBe(
      50,
      'Total supply should be 50 after User1 burns 50.',
    );

    liquidityManager.updateAllowance(user2, user1, 50, true);
    expect(liquidityManager.getAllowance(user2, user1)).toBe(
      50,
      'Allowance of User1 by User2 should be 50.',
    );
    liquidityManager.transferFrom(user2, user1, user1, 50);
    expect(liquidityManager.getAllowance(user2, user1)).toBe(
      0,
      'Allowance of User1 by User2 should be 0 after transferFrom.',
    );
    expect(liquidityManager.getBalance(user1)).toBe(
      50,
      "User1's balance should be 50 after transferFrom.",
    );

    liquidityManager.removeAllowance(user2, user1);
    expect(liquidityManager.getAllowance(user2, user1)).toBe(
      0,
      'Allowance of User1 by User2 should be 0 after removal.',
    );
  });
});

const storagePrefixManager = new StoragePrefixManager();
const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

const user1 = new Address(
  'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
);
const user2 = new Address(
  'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
);

describe('LiquidityManager - unit tests', () => {
  test('mint and burn', () => {
    expect(liquidityManager.getTotalSupply()).toBe(
      0,
      'Uninitialized total supply should be 0.',
    );

    liquidityManager.mint(user1, 100);
    expect(liquidityManager.getBalance(user1)).toBe(
      100,
      "User's balance should match minted amount.",
    );
    expect(liquidityManager.getTotalSupply()).toBe(
      100,
      'Minted amount should increase total supply.',
    );

    liquidityManager.burn(user1, 50);
    expect(liquidityManager.getBalance(user1)).toBe(
      50,
      "User's balance should decrease after burn.",
    );
    expect(liquidityManager.getTotalSupply()).toBe(
      50,
      'Burned amount should decrease total supply.',
    );
  });

  test('burn with insufficient balance', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );

      liquidityManager.mint(user1, 99);
      liquidityManager.burn(user1, 100);
    }).toThrow('burn should reject if not enough balance.');

    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );

      liquidityManager.burn(user1, 100);
    }).toThrow('burn should reject uninitialized balance.');
  });

  test('removeBalance with 0 amount', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );

      liquidityManager.mint(user1, 100);
      liquidityManager.burn(user1, 100);
      liquidityManager.removeBalance(user1);
    }).not.toThrow('removeBalance should free zero balance.');
  });

  test('removeBalance with non-null amount', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );

      liquidityManager.mint(user1, 100);
      liquidityManager.removeBalance(user1);
    }).toThrow('removeBalance should reject non zero balance.');
  });

  test('transfer', () => {
    liquidityManager.mint(user1, 100);
    liquidityManager.transfer(user1, user2, 100);
    expect(liquidityManager.getBalance(user1)).toBe(
      0,
      'From balance should decrease after transfer.',
    );
    expect(liquidityManager.getBalance(user2)).toBe(
      100,
      'To balance should increase after transfer.',
    );
  });

  test('transfer with insufficient balance', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const user2 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );

      liquidityManager.mint(user1, 100);
      liquidityManager.transfer(user1, user2, 101);
    }).toThrow('transfer should reject if not enough balance');
  });

  test('updateAllowance', () => {
    liquidityManager.mint(user1, 100);
    expect(liquidityManager.getAllowance(user1, user2)).toBe(
      0,
      'Uninitialized allowance should be 0.',
    );

    liquidityManager.updateAllowance(user1, user2, 100, true);

    expect(liquidityManager.getAllowance(user1, user2)).toBe(
      100,
      'Allowance of owner by spender should be set.',
    );

    liquidityManager.updateAllowance(user1, user2, 20, false);
    expect(liquidityManager.getAllowance(user1, user2)).toBe(
      80,
      'Allowance of spender should be updated by delta.',
    );
  });

  test('transferFrom', () => {
    liquidityManager.mint(user1, 100);
    liquidityManager.updateAllowance(user1, user2, 100, true);

    liquidityManager.transferFrom(user1, user2, user2, 50);
    expect(liquidityManager.getBalance(user1)).toBe(
      50,
      'transferFrom should decrease owner balance.',
    );
    expect(liquidityManager.getBalance(user2)).toBe(
      50,
      'transferFrom should increase receiver balance.',
    );
    expect(liquidityManager.getAllowance(user1, user2)).toBe(
      50,
      'transferFrom should decrease spender allowance.',
    );

    liquidityManager.updateAllowance(user1, user2, 20, false);
    expect(liquidityManager.getAllowance(user1, user2)).toBe(
      30,
      'transferFrom should decrease allowance',
    );
  });

  test('transferFrom with insufficient allowance', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const user2 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );

      liquidityManager.mint(user1, 105);
      liquidityManager.updateAllowance(user1, user2, 100, true);

      liquidityManager.transferFrom(user2, user1, user1, 101);
    }).toThrow('transferFrom should reject if not enough allowance.');
  });

  test('removeAllowance with 0 amount', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const user2 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );

      liquidityManager.mint(user1, 100);
      liquidityManager.updateAllowance(user1, user2, 100, true);

      liquidityManager.updateAllowance(user1, user2, 100, false);

      liquidityManager.removeAllowance(user1, user2);
    }).not.toThrow('removeAllowance should free zero allowance.');
  });

  test('removeAllowance with non-null amount', () => {
    expect(() => {
      resetStorage();
      const storagePrefixManager = new StoragePrefixManager();
      const liquidityManager = new LiquidityManager<u8>(storagePrefixManager);

      const user1 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const user2 = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );

      liquidityManager.mint(user1, 100);
      liquidityManager.updateAllowance(user1, user2, 100, true);

      liquidityManager.removeAllowance(user1, user2);
    }).toThrow('removeAllowance should reject if non zero allowance.');
  });
});
