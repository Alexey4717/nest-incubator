import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';

import { SessionOrmEntity } from '../../infrastructure/session.orm-entity';

export type SessionCreateProps = {
  deviceId: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
};

export type SessionDb = {
  deviceId: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
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

  updateLastActiveDate(expectedLastActiveDate: string, newLastActiveDate: string): void {
    const expected = new Date(expectedLastActiveDate).getTime();
    const current = this.data.lastActiveDate.getTime();
    if (expected !== current) {
      throw new DomainException(DomainExceptionCode.NotFound);
    }
    this.data = { ...this.data, lastActiveDate: new Date(newLastActiveDate) };
  }
}
