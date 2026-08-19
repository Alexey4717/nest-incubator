import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionConfig } from '../../session.config';

@Injectable()
export class DeleteExpiredSessionsUseCase implements IUseCase<void, Notification<null>> {
  constructor(
    private readonly sessionConfig: SessionConfig,
    private readonly sessionRepository: SessionRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(): Promise<Notification<null>> {
    return this.execute();
  }

  async execute(): Promise<Notification<null>> {
    const refreshTokenLifeTime = this.sessionConfig.REFRESH_TOKEN_LIFE_TIME;
    const expiredISOStringValueFromNow = new Date(
      +new Date() - refreshTokenLifeTime * 1000,
    ).toISOString();
    await this.sessionRepository.deleteAllExpiredSessions(expiredISOStringValueFromNow);
    return Notification.ok(null);
  }
}
