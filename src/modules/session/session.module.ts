import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';

import { SessionService } from './application/session.service';
import { SessionQueryRepository } from './infrastructure/session-query.repository.mongodb';
import { SessionRepository } from './infrastructure/session.repository.mongodb';
import { SessionConfig } from './session.config';

@Module({
  imports: [DatabaseModule],
  providers: [SessionConfig, SessionService, SessionRepository, SessionQueryRepository],
  exports: [SessionConfig, SessionService, SessionRepository, SessionQueryRepository],
})
export class SessionModule {}
