import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User as UserEntity } from '../../user/models/user.schema';
import { RefreshTokenJwtPayloadDto } from '../dto/refresh-token-jwt-payload.dto';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = UserEntity>(
    err: Error | null,
    result:
      | { user: UserEntity; payload: RefreshTokenJwtPayloadDto }
      | false
      | null,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !result) {
      throw err || new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    request.user = result.user;
    request.refreshTokenJWTPayload = result.payload;
    return result.user as TUser;
  }
}
