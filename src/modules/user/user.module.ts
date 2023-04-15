import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { UserRepository } from './infrastructure/user.repository';
import { UserQueryRepository } from './infrastructure/user-query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.schema';
// import { UserLoginExistsValidator } from '../../validators/user-login-exists.validator';
// import { UserEmailExistsValidator } from '../../validators/user-email-exists.validator';

const schemas = [{ name: User.name, schema: UserSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserQueryRepository,
    // UserLoginExistsValidator,
    // UserEmailExistsValidator,
  ],
})
export class UserModule {}
