import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CoreModule } from '@/shared/core/core.module';

import { DatabaseModule } from '@/modules/database/database.module';
import { EmailModule } from '@/modules/email/email.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './api/auth.controller';
import { LoginHandler } from './application/commands/login.command';
import { LogoutHandler } from './application/commands/logout.command';
import { NewPasswordHandler } from './application/commands/new-password.command';
import { PasswordRecoveryHandler } from './application/commands/password-recovery.command';
import { RefreshTokenHandler } from './application/commands/refresh-token.command';
import { RegistrationConfirmationHandler } from './application/commands/registration-confirmation.command';
import { RegistrationEmailResendingHandler } from './application/commands/registration-email-resending.command';
import { RegistrationHandler } from './application/commands/registration.command';
import { GetMeHandler } from './application/queries/get-me.query';
import { JwtTokenService } from './application/services/jwt-token.service';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { NewPasswordUseCase } from './application/use-cases/new-password.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { AuthConfigModule } from './auth-config.module';
import { AuthConfig } from './auth.config';
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from './guards/get-userId-from-bearer-token';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

const authUseCases = [
  LoginUseCase,
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetMeUseCase,
];

const authCommandHandlers = [
  LoginHandler,
  RegistrationHandler,
  RegistrationConfirmationHandler,
  RegistrationEmailResendingHandler,
  PasswordRecoveryHandler,
  NewPasswordHandler,
  RefreshTokenHandler,
  LogoutHandler,
];

const authQueryHandlers = [GetMeHandler];

const authDomainServices = [JwtTokenService];

@Module({
  imports: [
    CoreModule,
    CqrsModule,
    AuthConfigModule,
    DatabaseModule,
    EmailModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.ACCESS_TOKEN_SECRET,
        signOptions: {
          expiresIn: authConfig.ACCESS_TOKEN_LIFE_TIME,
        },
      }),
      inject: [AuthConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...authDomainServices,
    ...authUseCases,
    ...authCommandHandlers,
    ...authQueryHandlers,
    LocalStrategy,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    BasicStrategy,
    LocalAuthGuard,
    AccessJwtAuthGuard,
    RefreshJwtAuthGuard,
    BasicAuthGuard,
    GetUserIdFromBearerToken,
  ],
  exports: [
    AuthConfigModule,
    JwtModule,
    LocalAuthGuard,
    AccessJwtAuthGuard,
    RefreshJwtAuthGuard,
    BasicAuthGuard,
    GetUserIdFromBearerToken,
  ],
})
export class AuthModule {}
