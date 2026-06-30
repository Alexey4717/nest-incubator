import { Module } from '@nestjs/common';

import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { SessionService } from './application/session.service';
import { SessionQueryRepository } from './infrastructure/session-query.repository.mongodb';
import { SessionRepository } from './infrastructure/session.repository.mongodb';

@Module({
  imports: [MongooseModelsModule],
  providers: [SessionService, SessionRepository, SessionQueryRepository],
  exports: [SessionService, SessionRepository, SessionQueryRepository],
})
export class SessionModule {}
