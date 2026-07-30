import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { DeleteExpiredSessionsUseCase } from './application/use-cases/delete-expired-sessions.use-case';
import { DeleteOtherSessionsUseCase } from './application/use-cases/delete-other-sessions.use-case';
import { DeleteSessionUseCase } from './application/use-cases/delete-session.use-case';
import { FindAllDevicesUseCase } from './application/use-cases/find-all-devices.use-case';
import { UpdateSessionAfterRefreshUseCase } from './application/use-cases/update-session-after-refresh.use-case';
import { SessionQueryRepository } from './infrastructure/session-query.repository';
import { SessionOrmEntity } from './infrastructure/session.orm-entity';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionConfig } from './session.config';

const sessionUseCases = [
  CreateSessionUseCase,
  DeleteSessionUseCase,
  DeleteOtherSessionsUseCase,
  UpdateSessionAfterRefreshUseCase,
  FindAllDevicesUseCase,
  DeleteExpiredSessionsUseCase,
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SessionOrmEntity])],
  providers: [SessionConfig, SessionRepository, SessionQueryRepository, ...sessionUseCases],
  exports: [SessionConfig, SessionRepository, SessionQueryRepository, ...sessionUseCases],
})
export class SessionModule {}
