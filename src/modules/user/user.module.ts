import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { UserRepository } from './infrastructure/user.repository.mongodb';
import { UserQueryRepository } from './infrastructure/user-query.repository.mongodb';
import { MongooseModelsModule } from '../database/mongoose-models.module';
import { UserLoginExistsValidator } from '../../validators/user-login-exists.validator';
import { UserEmailExistsValidator } from '../../validators/user-email-exists.validator';

@Module({
  imports: [MongooseModelsModule],
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
