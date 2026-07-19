import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionConfig } from '../../session.config';

@Injectable()
export class DeleteExpiredSessionsUseCase implements IUseCase<void, ResultType<null>> {
  constructor(
    private readonly sessionConfig: SessionConfig,
    private readonly sessionRepository: SessionRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(): Promise<ResultType<null>> {
    return this.execute();
  }

  async execute(): Promise<ResultType<null>> {
    const refreshTokenLifeTime = this.sessionConfig.REFRESH_TOKEN_LIFE_TIME;
    const expiredISOStringValueFromNow = new Date(
      +new Date() - refreshTokenLifeTime * 1000,
    ).toISOString();
    await this.sessionRepository.deleteAllExpiredSessions(expiredISOStringValueFromNow);
    return Result.ok(null);
  }
}
