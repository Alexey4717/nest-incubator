import { add } from 'date-fns';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { UserDb, UserEntity } from './user.entity';

describe('UserEntity', () => {
  const baseDb = (overrides: Partial<UserDb> = {}): UserDb => ({
    id: 'user-1',
    login: 'login',
    email: 'a@b.c',
    passwordHash: 'hash',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    confirmationCode: 'code-1',
    confirmationExpiration: add(new Date(), { hours: 1 }),
    isConfirmed: false,
    recoveryCode: null,
    recoveryExpiration: null,
    ...overrides,
  });

  describe('create / reconstitute', () => {
    it('creates unconfirmed user with confirmation data', () => {
      const user = UserEntity.create({
        login: 'login',
        email: 'a@b.c',
        passwordHash: 'hash',
        isConfirmed: false,
      });

      const db = user.toDb();
      expect(db.login).toBe('login');
      expect(db.email).toBe('a@b.c');
      expect(db.passwordHash).toBe('hash');
      expect(db.isConfirmed).toBe(false);
      expect(db.confirmationCode).toEqual(expect.any(String));
      expect(db.confirmationExpiration).toBeInstanceOf(Date);
      expect(db.recoveryCode).toBeNull();
    });

    it('reconstitutes and normalizes createdAt from string', () => {
      const user = UserEntity.reconstitute({
        ...baseDb(),
        createdAt: '2021-05-01T12:00:00.000Z' as unknown as Date,
      });

      expect(user.id).toBe('user-1');
      expect(user.toDb().createdAt).toEqual(new Date('2021-05-01T12:00:00.000Z'));
    });
  });

  describe('assertNotConfirmed / confirmEmail', () => {
    it('throws when email is already confirmed', () => {
      const user = UserEntity.reconstitute(baseDb({ isConfirmed: true }));

      expect(() => user.assertNotConfirmed()).toThrow(DomainException);
      try {
        user.assertNotConfirmed();
      } catch (e) {
        expect(e).toMatchObject({
          code: DomainExceptionCode.BadRequest,
          extensions: [{ field: 'email' }],
        });
      }
    });

    it('confirms email with valid code', () => {
      const user = UserEntity.reconstitute(baseDb({ confirmationCode: 'valid' }));

      user.confirmEmail('valid');

      expect(user.isEmailConfirmed()).toBe(true);
    });

    it('rejects confirm when already confirmed', () => {
      const user = UserEntity.reconstitute(baseDb({ isConfirmed: true }));

      expect(() => user.confirmEmail('valid')).toThrow(DomainException);
    });

    it('rejects confirm with wrong or expired code', () => {
      const expired = UserEntity.reconstitute(
        baseDb({
          confirmationCode: 'valid',
          confirmationExpiration: add(new Date(), { hours: -1 }),
        }),
      );
      const wrong = UserEntity.reconstitute(baseDb({ confirmationCode: 'valid' }));

      expect(() => expired.confirmEmail('valid')).toThrow(DomainException);
      expect(() => wrong.confirmEmail('other')).toThrow(DomainException);
    });
  });

  describe('recovery / password', () => {
    it('validates recovery code and clears it after password change', () => {
      const user = UserEntity.reconstitute(
        baseDb({
          recoveryCode: 'rec',
          recoveryExpiration: add(new Date(), { hours: 1 }),
        }),
      );

      user.validateRecoveryCode('rec');
      user.changePassword('new-hash');

      const db = user.toDb();
      expect(db.passwordHash).toBe('new-hash');
      expect(db.recoveryCode).toBeNull();
      expect(db.recoveryExpiration).toBeNull();
    });

    it('rejects invalid or expired recovery code', () => {
      const user = UserEntity.reconstitute(
        baseDb({
          recoveryCode: 'rec',
          recoveryExpiration: add(new Date(), { hours: -1 }),
        }),
      );

      expect(() => user.validateRecoveryCode('rec')).toThrow(DomainException);
      expect(() => user.validateRecoveryCode('wrong')).toThrow(DomainException);
    });

    it('sets recovery and updates confirmation code', () => {
      const user = UserEntity.reconstitute(baseDb());
      const expiration = add(new Date(), { hours: 2 });

      user.setRecoveryData({ recoveryCode: 'r1', recoveryExpiration: expiration });
      user.updateConfirmationCode('new-code');

      const db = user.toDb();
      expect(db.recoveryCode).toBe('r1');
      expect(db.recoveryExpiration).toEqual(expiration);
      expect(db.confirmationCode).toBe('new-code');
      expect(db.confirmationExpiration!.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
