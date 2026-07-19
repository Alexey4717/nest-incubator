import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';

import { SessionOrmEntity } from '../../infrastructure/session.orm-entity';

export type SessionCreateProps = {
  deviceId: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  currentRefreshTokenJti: string;
};

export type SessionDb = {
  deviceId: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  currentRefreshTokenJti: string;
};

export class SessionEntity {
  private constructor(private data: SessionDb) {}

  static create(props: SessionCreateProps): SessionEntity {
    return new SessionEntity({
      deviceId: props.deviceId,
      userId: props.userId,
      ip: props.ip,
      title: props.title,
      lastActiveDate: new Date(props.lastActiveDate),
      currentRefreshTokenJti: props.currentRefreshTokenJti,
    });
  }

  static reconstitute(raw: SessionOrmEntity | SessionDb): SessionEntity {
    return new SessionEntity({
      deviceId: raw.deviceId,
      userId: raw.userId,
      ip: raw.ip,
      title: raw.title,
      lastActiveDate:
        raw.lastActiveDate instanceof Date ? raw.lastActiveDate : new Date(raw.lastActiveDate),
      currentRefreshTokenJti: raw.currentRefreshTokenJti,
    });
  }

  get deviceId(): string {
    return this.data.deviceId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get lastActiveDate(): string {
    return this.data.lastActiveDate.toISOString();
  }

  get currentRefreshTokenJti(): string {
    return this.data.currentRefreshTokenJti;
  }

  toDb(): SessionDb {
    return { ...this.data };
  }

  belongsTo(userId: string): boolean {
    return this.data.userId === userId;
  }

  canBeDeletedBy(userId: string): void {
    if (!this.belongsTo(userId)) {
      throw new DomainException(DomainExceptionCode.Forbidden);
    }
  }

  rotateRefreshToken(expectedJti: string, newJti: string, lastActiveDate: string): void {
    if (this.data.currentRefreshTokenJti !== expectedJti) {
      throw new DomainException(DomainExceptionCode.NotFound);
    }
    this.data = {
      ...this.data,
      currentRefreshTokenJti: newJti,
      lastActiveDate: new Date(lastActiveDate),
    };
  }
}
