import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/modules/database/database.module';

import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { DeleteExpiredSessionsUseCase } from './application/use-cases/delete-expired-sessions.use-case';
import { DeleteOtherSessionsUseCase } from './application/use-cases/delete-other-sessions.use-case';
import { DeleteSessionUseCase } from './application/use-cases/delete-session.use-case';
import { FindAllDevicesUseCase } from './application/use-cases/find-all-devices.use-case';
import { UpdateSessionAfterRefreshUseCase } from './application/use-cases/update-session-after-refresh.use-case';
import { SessionQueryRepository } from './infrastructure/session-query.repository.mongodb';
import { SessionRepository } from './infrastructure/session.repository.mongodb';
import { SessionConfig } from './session.config';

const sessionUseCases = [
  CreateSessionUseCase,
  DeleteSessionUseCase,
  DeleteOtherSessionsUseCase,
  UpdateSessionAfterRefreshUseCase,
  FindAllDevicesUseCase,
  DeleteExpiredSessionsUseCase,
];

@Module({
  imports: [DatabaseModule],
  providers: [SessionConfig, SessionRepository, SessionQueryRepository, ...sessionUseCases],
  exports: [SessionConfig, SessionRepository, SessionQueryRepository, ...sessionUseCases],
})
export class SessionModule {}
