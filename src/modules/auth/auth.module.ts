import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { BasicStrategy } from './strategies/basic.strategy';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { GetUserIdFromBearerToken } from './guards/get-userId-from-bearer-token';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';
import { MongooseModelsModule } from '../database/mongoose-models.module';
import { UserModule } from '../user/user.module';

const MIN_ACCESS_TOKEN_TTL_SEC = parseInt(
  process.env.ACCESS_TOKEN_LIFE_TIME,
  10,
);

@Module({
  imports: [
    MongooseModelsModule,
    EmailModule,
    SessionModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const accessParsed = parseInt(
          configService.get<string>('ACCESS_TOKEN_LIFE_TIME'),
          10,
        );
        const expiresIn = Number.isFinite(accessParsed)
          ? Math.max(MIN_ACCESS_TOKEN_TTL_SEC, accessParsed)
          : MIN_ACCESS_TOKEN_TTL_SEC;

        return {
          secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn },
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
