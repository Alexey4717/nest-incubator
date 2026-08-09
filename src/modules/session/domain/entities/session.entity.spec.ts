import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { SessionDb, SessionEntity } from './session.entity';

describe('SessionEntity', () => {
  const baseDb = (overrides: Partial<SessionDb> = {}): SessionDb => ({
    deviceId: 'device-1',
    userId: 'user-1',
    ip: '127.0.0.1',
    title: 'Chrome',
    lastActiveDate: new Date('2020-01-01T00:00:00.000Z'),
    currentRefreshTokenJti: 'jti-1',
    ...overrides,
  });

  it('creates session from props', () => {
    const session = SessionEntity.create({
      deviceId: 'device-1',
      userId: 'user-1',
      ip: '127.0.0.1',
      title: 'Chrome',
      lastActiveDate: '2020-01-01T00:00:00.000Z',
      currentRefreshTokenJti: 'jti-1',
    });

    expect(session.deviceId).toBe('device-1');
    expect(session.userId).toBe('user-1');
    expect(session.currentRefreshTokenJti).toBe('jti-1');
    expect(session.lastActiveDate).toBe('2020-01-01T00:00:00.000Z');
  });

  it('reconstitutes and normalizes lastActiveDate from string', () => {
    const session = SessionEntity.reconstitute({
      ...baseDb(),
      lastActiveDate: '2021-02-02T00:00:00.000Z' as unknown as Date,
    });

    expect(session.lastActiveDate).toBe('2021-02-02T00:00:00.000Z');
  });

  it('belongsTo and canBeDeletedBy enforce ownership', () => {
    const session = SessionEntity.reconstitute(baseDb());

    expect(session.belongsTo('user-1')).toBe(true);
    expect(session.belongsTo('other')).toBe(false);
    expect(() => session.canBeDeletedBy('user-1')).not.toThrow();
    expect(() => session.canBeDeletedBy('other')).toThrow(DomainException);
    try {
      session.canBeDeletedBy('other');
    } catch (e) {
      expect((e as DomainException).code).toBe(DomainExceptionCode.Forbidden);
    }
  });

  it('rotates refresh token when jti matches', () => {
    const session = SessionEntity.reconstitute(baseDb());

    session.rotateRefreshToken('jti-1', 'jti-2', '2022-01-01T00:00:00.000Z');

    expect(session.currentRefreshTokenJti).toBe('jti-2');
    expect(session.lastActiveDate).toBe('2022-01-01T00:00:00.000Z');
  });

  it('throws NotFound when rotate expected jti mismatches', () => {
    const session = SessionEntity.reconstitute(baseDb());

    expect(() => session.rotateRefreshToken('wrong', 'jti-2', '2022-01-01T00:00:00.000Z')).toThrow(
      DomainException,
    );
    try {
      session.rotateRefreshToken('wrong', 'jti-2', '2022-01-01T00:00:00.000Z');
    } catch (e) {
      expect((e as DomainException).code).toBe(DomainExceptionCode.NotFound);
    }
  });
});
