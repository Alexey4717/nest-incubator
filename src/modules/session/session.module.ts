import { Module } from '@nestjs/common';
import { SessionService } from './application/session.service';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionQueryRepository } from './infrastructure/session-query.repository';
import { Session, SessionSchema } from './models/session.schema';
import { MongooseModule } from '@nestjs/mongoose';

const schemas = [{ name: Session.name, schema: SessionSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  providers: [SessionService, SessionRepository, SessionQueryRepository],
  exports: [SessionService, SessionRepository, SessionQueryRepository],
})
export class SessionModule {}
