import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserQueryRepository } from '../modules/user/infrastructure/user-query.repository';
import { JwtService } from '../modules/auth/application/jwt.service';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, accessToken] = auth.split(' ');
    if (authType !== 'Bearer' || !accessToken)
      throw new UnauthorizedException();
    const jwtPayload = await this.jwtService.verifyAccessToken(accessToken);
    if (!jwtPayload) throw new UnauthorizedException();
    const user = await this.userQueryRepository.findUserById(jwtPayload.userId);
    if (!user) throw new UnauthorizedException();
    request.user = user;
    return true;
  }
}
