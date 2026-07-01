import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';

import { CurrentUserId } from '@/shared/decorators/param/currentUserId.decorator';
import { RefreshToken } from '@/shared/decorators/param/refresh-token.decorator';
import { UserAgent } from '@/shared/decorators/param/user-agent.decorator';

import { LoginCommand } from '../application/commands/login.command';
import { LogoutCommand } from '../application/commands/logout.command';
import { NewPasswordCommand } from '../application/commands/new-password.command';
import { PasswordRecoveryCommand } from '../application/commands/password-recovery.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token.command';
import { RegistrationConfirmationCommand } from '../application/commands/registration-confirmation.command';
import { RegistrationEmailResendingCommand } from '../application/commands/registration-email-resending.command';
import { RegistrationCommand } from '../application/commands/registration.command';
import { GetMeQuery } from '../application/queries/get-me.query';
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

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @SkipThrottle(false)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUserId() userId: string,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const tokens = await this.commandBus.execute(new LoginCommand({ userId, ip, userAgent }));
      if (!tokens) throw new UnauthorizedException();
      const { accessToken, refreshToken } = tokens;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @SkipThrottle(false)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() recoveryPasswordDto: RecoveryPasswordDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(recoveryPasswordDto.email));
  }

  @SkipThrottle(false)
  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordDto));
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @RefreshToken() token: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    if (!token) throw new UnauthorizedException();
    try {
      const tokens = await this.commandBus.execute(new RefreshTokenCommand(token));
      if (!tokens) throw new UnauthorizedException();
      const { accessToken, refreshToken } = tokens;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @SkipThrottle(false)
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() registrationDto: RegistrationDto) {
    return this.commandBus.execute(new RegistrationCommand(registrationDto));
  }

  @SkipThrottle(false)
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(registrationEmailResendingDto.email),
    );
  }

  @SkipThrottle(false)
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() registrationConfirmationDto: RegistrationConfirmationDto) {
    return this.commandBus.execute(
      new RegistrationConfirmationCommand(registrationConfirmationDto.code),
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @CurrentUserId() userId: string,
    @RefreshTokenJwtPayload() refreshTokenJWTPayload: IRefreshTokenJwtPayload,
  ) {
    const isDeleted = await this.commandBus.execute(
      new LogoutCommand({ userId, refreshTokenJWTPayload }),
    );
    if (!isDeleted) throw new UnauthorizedException();
    return;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('/me')
  @HttpCode(200)
  async aboutMe(@CurrentUserId() userId: string) {
    const me = await this.queryBus.execute(new GetMeQuery(userId));
    if (!me) throw new UnauthorizedException();
    return me;
  }
}
