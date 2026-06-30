import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';
import { EmailModule } from '@/modules/email/email.module';
import { SessionModule } from '@/modules/session/session.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from './guards/get-userId-from-bearer-token';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    MongooseModelsModule,
    EmailModule,
    SessionModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
          signOptions: {
            expiresIn:
              configService.get<string>('ACCESS_TOKEN_LIFE_TIME') ??
              process.env.ACCESS_TOKEN_LIFE_TIME,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
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
    AuthService,
    JwtModule,
    LocalAuthGuard,
    AccessJwtAuthGuard,
    RefreshJwtAuthGuard,
    BasicAuthGuard,
    GetUserIdFromBearerToken,
  ],
})
export class AuthModule {}
