import { Body, Controller, Get, HttpCode, Ip, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CookieOptions, Response } from 'express';

import { CoreConfig } from '@/core/core.config';
import { CurrentUserId } from '@/core/decorators/param/currentUserId.decorator';
import { RefreshToken } from '@/core/decorators/param/refresh-token.decorator';
import { UserAgent } from '@/core/decorators/param/user-agent.decorator';
import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { throwIfNotFound } from '@/core/errors/throw-if-not-found';
import { notificationToDomainException } from '@/core/notification/notification-to-domain';

import { LoginCommand } from '../application/commands/login.command';
import { LogoutCommand } from '../application/commands/logout.command';
import { NewPasswordCommand } from '../application/commands/new-password.command';
import { PasswordRecoveryCommand } from '../application/commands/password-recovery.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token.command';
import { RegistrationConfirmationCommand } from '../application/commands/registration-confirmation.command';
import { RegistrationEmailResendingCommand } from '../application/commands/registration-email-resending.command';
import { RegistrationCommand } from '../application/commands/registration.command';
import { GetMeQuery } from '../application/queries/get-me.query';
import { AuthConfig } from '../auth.config';
import { RefreshTokenJwtPayload } from '../decorators/refresh-token-jwt-payload.decorator';
import { LoginDto } from '../dto/login.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { RegistrationEmailResendingDto } from '../dto/registration-email-resending.dto';
import { RegistrationDto } from '../dto/registration.dto';
import { AccessJwtAuthGuard } from '../guards/access-jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshJwtAuthGuard } from '../guards/refresh-jwt-auth.guard';
import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';
import {
  ApiGetMe,
  ApiLogin,
  ApiLogout,
  ApiNewPassword,
  ApiPasswordRecovery,
  ApiRefreshToken,
  ApiRegistration,
  ApiRegistrationConfirmation,
  ApiRegistrationEmailResending,
} from './auth.swagger.decorators';

@SkipThrottle()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authConfig: AuthConfig,
    private readonly coreConfig: CoreConfig,
  ) {}

  private getRefreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.coreConfig.isProduction,
      sameSite: 'strict',
      maxAge: this.authConfig.REFRESH_TOKEN_LIFE_TIME * 1000,
    };
  }

  @SkipThrottle(false)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiLogin()
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUserId() userId: string,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.commandBus.execute(new LoginCommand({ userId, ip, userAgent }));
    if (!tokens) {
      throw new DomainException(DomainExceptionCode.Unauthorized);
    }
    const { accessToken, refreshToken } = tokens;
    res.cookie('refreshToken', refreshToken, this.getRefreshTokenCookieOptions());
    return { accessToken };
  }

  @SkipThrottle(false)
  @Post('password-recovery')
  @HttpCode(204)
  @ApiPasswordRecovery()
  async passwordRecovery(@Body() recoveryPasswordDto: RecoveryPasswordDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(recoveryPasswordDto.email));
  }

  @SkipThrottle(false)
  @Post('new-password')
  @HttpCode(204)
  @ApiNewPassword()
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordDto));
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiRefreshToken()
  async refreshToken(
    @RefreshToken() token: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    if (!token) {
      throw new DomainException(DomainExceptionCode.Unauthorized);
    }
    const tokens = await this.commandBus.execute(new RefreshTokenCommand(token));
    if (!tokens) {
      throw new DomainException(DomainExceptionCode.Unauthorized);
    }
    const { accessToken, refreshToken } = tokens;
    res.cookie('refreshToken', refreshToken, this.getRefreshTokenCookieOptions());
    return { accessToken };
  }

  @SkipThrottle(false)
  @Post('registration')
  @HttpCode(204)
  @ApiRegistration()
  async registration(@Body() registrationDto: RegistrationDto) {
    return this.commandBus.execute(new RegistrationCommand(registrationDto));
  }

  @SkipThrottle(false)
  @Post('registration-email-resending')
  @HttpCode(204)
  @ApiRegistrationEmailResending()
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    notificationToDomainException(
      await this.commandBus.execute(
        new RegistrationEmailResendingCommand(registrationEmailResendingDto.email),
      ),
    );
  }

  @SkipThrottle(false)
  @Post('registration-confirmation')
  @HttpCode(204)
  @ApiRegistrationConfirmation()
  async registrationConfirmation(@Body() registrationConfirmationDto: RegistrationConfirmationDto) {
    return this.commandBus.execute(
      new RegistrationConfirmationCommand(registrationConfirmationDto.code),
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  @ApiLogout()
  async logout(
    @CurrentUserId() userId: string,
    @RefreshTokenJwtPayload() refreshTokenJWTPayload: IRefreshTokenJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    notificationToDomainException(
      await this.commandBus.execute(new LogoutCommand({ userId, refreshTokenJWTPayload })),
    );
    res.clearCookie('refreshToken', this.getRefreshTokenCookieOptions());
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  @HttpCode(200)
  @ApiGetMe()
  async aboutMe(@CurrentUserId() userId: string) {
    return throwIfNotFound(await this.queryBus.execute(new GetMeQuery(userId)));
  }
}
