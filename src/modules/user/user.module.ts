import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule } from '@/core/core.module';

import { AuthModule } from '@/modules/auth/auth.module';

import { UserController } from './api/user.controller';
import { ChangePasswordHandler } from './application/commands/change-password.command';
import { ConfirmEmailHandler } from './application/commands/confirm-email.command';
import { CreateUserHandler } from './application/commands/create-user.command';
import { DeleteUserHandler } from './application/commands/delete-user.command';
import { RegisterUserHandler } from './application/commands/register-user.command';
import { CheckCredentialsHandler } from './application/queries/check-credentials.query';
import { FindUserByIdHandler } from './application/queries/find-user-by-id.query';
import { GetUsersHandler } from './application/queries/get-users.query';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { CheckCredentialsUseCase } from './application/use-cases/check-credentials.use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { UserQueryRepository } from './infrastructure/user-query.repository';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { UserRepository } from './infrastructure/user.repository';
import { UserEmailExistsValidator } from './validators/user-email-exists.validator';
import { UserLoginExistsValidator } from './validators/user-login-exists.validator';

const userUseCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUsersUseCase,
  FindUserByIdUseCase,
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ChangePasswordUseCase,
  CheckCredentialsUseCase,
];

const userCommandHandlers = [
  CreateUserHandler,
  DeleteUserHandler,
  RegisterUserHandler,
  ConfirmEmailHandler,
  ChangePasswordHandler,
];

const userQueryHandlers = [GetUsersHandler, FindUserByIdHandler, CheckCredentialsHandler];

@Module({
  imports: [
    CqrsModule,
    CoreModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserQueryRepository,
    ...userUseCases,
    ...userCommandHandlers,
    ...userQueryHandlers,
    UserLoginExistsValidator,
    UserEmailExistsValidator,
  ],
  exports: [CreateUserUseCase, UserRepository, UserQueryRepository],
})
export class UserModule {}
