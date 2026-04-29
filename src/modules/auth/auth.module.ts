import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { UserRepository } from '../user/infrastructure/user.repository.mongodb';
import { UserQueryRepository } from '../user/infrastructure/user-query.repository.mongodb';
import { UserService } from '../user/application/user.service';
import { JwtService } from './application/jwt.service';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';
import { MongooseModelsModule } from '../database/mongoose-models.module';

@Module({
  imports: [MongooseModelsModule, EmailModule, SessionModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    UserService,
    UserRepository,
    UserQueryRepository,
  ],
  exports: [AuthService, JwtService, UserQueryRepository],
})
export class AuthModule {}
