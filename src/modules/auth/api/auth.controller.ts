import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { UserService } from '../../user/application/user.service';
import { LoginDto } from '../dto/login.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AccessJwtAuthGuard } from '../guards/access-jwt-auth.guard';
import { CurrentUserId } from '../../../decorators/param/currentUserId.decorator';
import { RegistrationDto } from '../dto/registration.dto';
import { RegistrationEmailResendingDto } from '../dto/registration-email-resending.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { UserAgent } from '../../../decorators/param/user-agent.decorator';
import { RefreshJwtAuthGuard } from '../guards/refresh-jwt-auth.guard';
import { RefreshToken } from '../../../decorators/param/refresh-token.decorator';
import { RefreshTokenJwtPayload } from '../../../decorators/param/refresh-token-jwt-payload.decorator';
import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';
import { SkipThrottle } from '@nestjs/throttler';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
    @Req() req: Request,
  ) {
    try {
      const tokens = await this.authService.login(userId, ip, userAgent);
      if (!tokens) throw new UnauthorizedException();
      const { accessToken, refreshToken } = tokens;
      req.res.cookie('refreshToken', refreshToken, {
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
    return this.authService.passwordRecovery(recoveryPasswordDto.email);
  }

  @SkipThrottle(false)
  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.newPassword(newPasswordDto);
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
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token,
      );
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
    return this.authService.registration(registrationDto);
  }

  @SkipThrottle(false)
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return this.authService.registrationEmailResending(
      registrationEmailResendingDto.email,
    );
  }

  @SkipThrottle(false)
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationDto,
  ) {
    return this.authService.registrationConfirmation(
      registrationConfirmationDto.code,
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @CurrentUserId() userId: string,
    @RefreshTokenJwtPayload() refreshTokenJWTPayload: IRefreshTokenJwtPayload,
  ) {
    const isDeleted = await this.authService.logout(
      userId,
      refreshTokenJWTPayload,
    );
    if (!isDeleted) throw new UnauthorizedException();
    return;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('/me')
  @HttpCode(200)
  async aboutMe(@CurrentUserId() userId: string) {
    const fullUser = await this.userService.findUserById(userId);
    if (!fullUser) throw new UnauthorizedException();
    return {
      userId: fullUser.id,
      login: fullUser.accountData.login,
      email: fullUser.accountData.email,
    };
  }
}
