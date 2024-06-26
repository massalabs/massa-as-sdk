import { Address, resetStorage } from '..';
import { AccessControl } from '../security/accessControl';

describe('AccessControl - use case tests', () => {
  test('should control access to functions 1', () => {
    resetStorage();

    expect(() => {
      const adminAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );

      const controller = new AccessControl<u8>(1);

      const ADMIN = controller.newPermission('admin');
      controller.grantPermission(ADMIN, adminAddress);

      const USER = controller.newPermission('user');
      controller.grantPermission(USER, userAddress);

      controller.mustHaveAnyPermission(ADMIN | USER, adminAddress);
      controller.mustHaveAnyPermission(ADMIN | USER, userAddress);
    }).not.toThrow('or on multiple permissions should work');
  });

  test('should control access to functions 2', () => {
    resetStorage();

    expect(() => {
      const adminAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKr',
      );
      const guestAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKs',
      );

      const controller = new AccessControl<u8>(1);

      const ADMIN = controller.newPermission('admin');
      controller.grantPermission(ADMIN, adminAddress);

      const USER = controller.newPermission('user');
      controller.grantPermission(USER, userAddress);

      controller.mustHaveAnyPermission(ADMIN | USER, guestAddress);
    }).toThrow('or on multiple permissions should work');
  });
});

describe('AccessControl - unit tests', () => {
  test('should create new permissions', () => {
    resetStorage();
    const accessControl = new AccessControl<u8>(1);
    const ADMIN = accessControl.newPermission('admin');
    expect(ADMIN).toStrictEqual(1, 'Admin permission should be 2⁰ = 1');
    const USER = accessControl.newPermission('user');
    expect(USER).toStrictEqual(2, 'User permission should be 2¹ = 2');
    const GUEST = accessControl.newPermission('guest');
    expect(GUEST).toStrictEqual(4, 'Guest permission should be 2² = 4');
  });

  test('should panic on unknown permission', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      accessControl.grantPermission(1, userAddress);
    }).toThrow('permission does not exist');
  });

  test('should not panic on adding permissions', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      accessControl.newPermission('p1');
      accessControl.newPermission('p2');
      accessControl.newPermission('p3');
      accessControl.newPermission('p4');
      accessControl.newPermission('p5');
      accessControl.newPermission('p6');
      accessControl.newPermission('p7');
      accessControl.newPermission('p8');
    }).not.toThrow('Up to 8 permissions should be allowed');
  });

  test('should panic on adding too many permissions', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      accessControl.newPermission('p1');
      accessControl.newPermission('p2');
      accessControl.newPermission('p3');
      accessControl.newPermission('p4');
      accessControl.newPermission('p5');
      accessControl.newPermission('p6');
      accessControl.newPermission('p7');
      accessControl.newPermission('p8');
      accessControl.newPermission('p9');
    }).toThrow('Permission index overflow');
  });

  test('should panic on adding permission twice', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      const ADMIN = accessControl.newPermission('admin');
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      accessControl.grantPermission(ADMIN, userAddress);
      accessControl.grantPermission(ADMIN, userAddress);
    }).toThrow('User already has admin permission');
  });

  test('should panic on missing must have permission', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      const ADMIN = accessControl.newPermission('admin');
      const USER = accessControl.newPermission('user');
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      accessControl.grantPermission(USER, userAddress);
      accessControl.mustHavePermission(ADMIN, userAddress);
    }).toThrow('User does not have admin permission');
  });

  test('should handle multiple permissions', () => {
    resetStorage();
    const accessControl = new AccessControl<u8>(1);
    const ADMIN = accessControl.newPermission('admin');
    const USER = accessControl.newPermission('user');
    const userAddress = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    accessControl.grantPermission(USER, userAddress);
    accessControl.mustHaveAnyPermission(ADMIN | USER, userAddress);
  });

  test('should panic on missing must have any permissions', () => {
    resetStorage();
    expect(() => {
      const accessControl = new AccessControl<u8>(1);
      const ADMIN = accessControl.newPermission('admin');
      const USER = accessControl.newPermission('user');
      const GUEST = accessControl.newPermission('guest');
      const userAddress = new Address(
        'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
      );
      accessControl.grantPermission(GUEST, userAddress);
      accessControl.mustHaveAnyPermission(ADMIN | USER, userAddress);
    }).toThrow('User does not have admin or user permission');
  });

  test('should add permissions to user', () => {
    resetStorage();
    const accessControl = new AccessControl<u8>(1);
    const ADMIN = accessControl.newPermission('admin');
    const USER = accessControl.newPermission('user');
    const GUEST = accessControl.newPermission('guest');
    const userAddress = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    accessControl.grantPermission(USER, userAddress);
    accessControl.grantPermission(GUEST, userAddress);

    expect(accessControl.hasPermission(USER, userAddress)).toBeTruthy(
      'User should have user permission',
    );
    expect(accessControl.hasPermission(GUEST, userAddress)).toBeTruthy(
      'User should have guest permission',
    );
    expect(accessControl.hasPermission(ADMIN, userAddress)).toBeFalsy(
      'User should not have admin permission',
    );
  });

  test('should remove permissions from user', () => {
    resetStorage();
    const accessControl = new AccessControl<u8>(1);
    const ADMIN = accessControl.newPermission('admin');
    const USER = accessControl.newPermission('user');
    const GUEST = accessControl.newPermission('guest');
    const userAddress = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    accessControl.grantPermission(USER, userAddress);
    accessControl.grantPermission(GUEST, userAddress);
    accessControl.grantPermission(ADMIN, userAddress);

    expect(accessControl.hasPermission(USER, userAddress)).toBeTruthy(
      'User should have user permission',
    );
    expect(accessControl.hasPermission(GUEST, userAddress)).toBeTruthy(
      'User should have guest permission',
    );
    expect(accessControl.hasPermission(ADMIN, userAddress)).toBeTruthy(
      'User should have admin permission',
    );

    accessControl.revokePermission(USER, userAddress);

    expect(accessControl.hasPermission(USER, userAddress)).toBeFalsy(
      'User should not have user permission',
    );
    expect(accessControl.hasPermission(GUEST, userAddress)).toBeTruthy(
      'User should have guest permission',
    );
    expect(accessControl.hasPermission(ADMIN, userAddress)).toBeTruthy(
      'User should have admin permission',
    );
  });

  test('should return proper throw message', () => {
    resetStorage();
    const accessControl = new AccessControl<u8>(1);
    const ADMIN = accessControl.newPermission('admin');
    const USER = accessControl.newPermission('user');
    const GUEST = accessControl.newPermission('guest');
    const userAddress = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );

    // accessControl.mustHavePermission(ADMIN, userAddress);
    // accessControl.mustHavePermission(USER, userAddress);
    // accessControl.mustHavePermission(GUEST, userAddress);
  });

  test('should handle multiple access control instances', () => {
    resetStorage();
    const accessControl1 = new AccessControl<u8>(1);
    const ADMIN = accessControl1.newPermission('admin');

    const accessControl2 = new AccessControl<u8>(2);
    const MECHANIC = accessControl2.newPermission('mechanic');

    const userAddress = new Address(
      'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq',
    );
    accessControl1.grantPermission(ADMIN, userAddress);

    expect(accessControl2.hasPermission(ADMIN, userAddress)).toBeFalsy(
      'User should not have car mechanic permission',
    );
  });
});
