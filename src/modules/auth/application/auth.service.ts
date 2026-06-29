import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UserService } from '../../user/application/user.service';
import { RegistrationDto } from '../dto/registration.dto';
import { EmailService } from '../../email/email.service';
import { UserQueryRepository } from '../../user/infrastructure/user-query.repository.mongodb';
import { UserRepository } from '../../user/infrastructure/user.repository.mongodb';
import { randomUUID } from 'crypto';
import { SessionService } from '../../session/application/session.service';
import { Session } from '../../session/models/session.schema';
import { SessionQueryRepository } from '../../session/infrastructure/session-query.repository.mongodb';
import { IRefreshTokenJwtPayload } from '../models/refresh-token-jwt-payload.model';
import { SessionRepository } from '../../session/infrastructure/session.repository.mongodb';
import { NewPasswordDto } from '../dto/new-password.dto';

@Injectable()
export class AuthService {
  private readonly accessTokenSecretKey: string;
  private readonly accessTokenLifeTimeSec: string | number;
  private readonly refreshTokenSecretKey: string;
  private readonly refreshTokenLifeTimeSec: string | number;

  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly sessionRepository: SessionRepository,
    private readonly sessionQueryRepository: SessionQueryRepository,
    private readonly emailService: EmailService,
  ) {
    this.accessTokenSecretKey = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    this.refreshTokenSecretKey = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    this.accessTokenLifeTimeSec =
      this.configService.get<string>('ACCESS_TOKEN_LIFE_TIME') ??
      process.env.ACCESS_TOKEN_LIFE_TIME ??
      300;

    this.refreshTokenLifeTimeSec =
      this.configService.get<string>('REFRESH_TOKEN_LIFE_TIME') ??
      process.env.REFRESH_TOKEN_LIFE_TIME ??
      20 * 60 * 60;
  }

  async login(userId: string, ip: string, userAgent: string) {
    const deviceId = randomUUID();
    const { accessToken, refreshToken } = await this.signAccessAndRefreshToken(
      userId,
      deviceId,
    );
    const lastActiveDate = this.getIssuedAtFromRefreshToken(refreshToken);
    const sessionInfo: Session = {
      ip,
      title: userAgent,
      lastActiveDate,
      deviceId,
      userId,
    };
    await this.sessionService.createNewSession(sessionInfo);
    return { accessToken, refreshToken };
  }

  async registration(registrationDto: RegistrationDto) {
    const user = await this.userService.registerUser(registrationDto);
    await this.emailService.sendRegistrationEmail(
      user.accountData.email,
      user.accountData.login,
      user.emailConfirmation.confirmationCode,
    );
    return;
  }

  async registrationEmailResending(email: string) {
    const user = await this.userQueryRepository.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: [
          {
            message: 'email not registered',
            field: 'email',
          },
        ],
        error: 'Bad Request',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        message: [
          {
            message: 'email already confirmed',
            field: 'email',
          },
        ],
        error: 'Bad Request',
      });
    }
    const newConfirmationCode = randomUUID();
    await this.userRepository.updateUserConfirmationCode({
      userId: user.id,
      newCode: newConfirmationCode,
    });
    await this.emailService.sendEmailWithNewConfirmationCode(
      user.accountData.email,
      user.accountData.login,
      newConfirmationCode,
    );
    return;
  }

  async registrationConfirmation(code: string) {
    await this.userService.confirmEmail(code);
  }

  async refreshToken(token: string) {
    let jwtPayload: IRefreshTokenJwtPayload | null = null;
    try {
      jwtPayload = this.nestJwtService.verify(token, {
        secret: this.refreshTokenSecretKey,
      }) as IRefreshTokenJwtPayload;
    } catch {
      return null;
    }
    if (!jwtPayload) return null;
    const userId = jwtPayload.userId;
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const user = await this.userService.findUserById(userId);
    if (!user) return null;
    const device =
      await this.sessionQueryRepository.findOneByDeviceAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return null;
    const { accessToken, refreshToken } = await this.signAccessAndRefreshToken(
      userId,
      deviceId,
    );
    const newLastActiveDate = this.getIssuedAtFromRefreshToken(refreshToken);
    await this.sessionService.updateSessionAfterRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
    return { accessToken, refreshToken };
  }

  async logout(
    userId: string,
    refreshTokenJWTPayload: IRefreshTokenJwtPayload,
  ) {
    const lastActiveDate = new Date(
      refreshTokenJWTPayload.iat * 1000,
    ).toISOString();
    return this.sessionRepository.deleteOneSessionByUserAndDeviceIdAndDate(
      userId,
      refreshTokenJWTPayload.deviceId,
      lastActiveDate,
    );
  }

  async passwordRecovery(email: string) {
    const user = await this.userQueryRepository.findUserByEmail(email);
    if (!user) return null;
    const recoveryCode = await this.userService.recoveryPassword(user.id);
    return this.emailService.sendPasswordRecoveryCode(
      user.accountData.email,
      user.accountData.login,
      recoveryCode,
    );
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    return this.userService.changeUserPassword({
      recoveryCode: newPasswordDto.recoveryCode,
      newPassword: newPasswordDto.newPassword,
    });
  }

  private signAccessAndRefreshToken(userId: string, deviceId: string) {
    const accessToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.accessTokenSecretKey,
        expiresIn: this.accessTokenLifeTimeSec,
      },
    );
    const refreshToken = this.nestJwtService.sign(
      { userId, deviceId },
      {
        secret: this.refreshTokenSecretKey,
        expiresIn: this.refreshTokenLifeTimeSec,
      },
    );
    return { accessToken, refreshToken };
  }

  private getIssuedAtFromRefreshToken(token: string): string {
    const payload = this.nestJwtService.decode(token) as { iat: number } | null;
    return new Date(payload!.iat * 1000).toISOString();
  }
}
