import { Module } from '@nestjs/common';
import { SessionService } from './application/session.service';
import { SessionRepository } from './infrastructure/session.repository.mongodb';
import { SessionQueryRepository } from './infrastructure/session-query.repository.mongodb';
import { MongooseModelsModule } from '../database/mongoose-models.module';

@Module({
  imports: [MongooseModelsModule],
  providers: [SessionService, SessionRepository, SessionQueryRepository],
  exports: [SessionService, SessionRepository, SessionQueryRepository],
})
export class SessionModule {}
