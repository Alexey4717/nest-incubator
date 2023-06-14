import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { UserRepository } from '../user/infrastructure/user.repository';
import { UserQueryRepository } from '../user/infrastructure/user-query.repository';
import { UserService } from '../user/application/user.service';
import { User, UserSchema } from '../user/models/user.schema';
import { JwtService } from './application/jwt.service';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';

const schemas = [{ name: User.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas), EmailModule, SessionModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    UserService,
    UserRepository,
    UserQueryRepository,
  ],
})
export class AuthModule {}
