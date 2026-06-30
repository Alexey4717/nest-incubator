import { forwardRef, Module } from '@nestjs/common';

import { UserEmailExistsValidator } from '@/modules/user/validators/user-email-exists.validator';
import { UserLoginExistsValidator } from '@/modules/user/validators/user-login-exists.validator';

import { AuthModule } from '@/modules/auth/auth.module';
import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { UserController } from './api/user.controller';
import { UserService } from './application/user.service';
import { UserQueryRepository } from './infrastructure/user-query.repository.mongodb';
import { UserRepository } from './infrastructure/user.repository.mongodb';

@Module({
  imports: [MongooseModelsModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserQueryRepository,
    UserLoginExistsValidator,
    UserEmailExistsValidator,
  ],
  exports: [UserService, UserRepository, UserQueryRepository],
})
export class UserModule {}
