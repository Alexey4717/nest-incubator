import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { UserQueryRepository } from '../../user/infrastructure/user-query.repository.mongodb';
import { User as UserEntity } from '../../user/models/user.schema';
import { RefreshTokenJwtPayloadDto } from '../dto/refresh-token-jwt-payload.dto';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.refreshToken ?? null,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(
    payload: RefreshTokenJwtPayloadDto,
  ): Promise<{ user: UserEntity; payload: RefreshTokenJwtPayloadDto }> {
    const user = await this.userQueryRepository.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user, payload };
  }
}
