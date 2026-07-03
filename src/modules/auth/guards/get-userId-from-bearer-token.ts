import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GetUserIdFromBearerToken implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      request.user = null;
      return true;
    }
    const authType = auth.split(' ')[0];
    if (authType !== 'Bearer') {
      request.user = null;
      return true;
    }
    const accessToken = auth.split(' ')[1];
    if (!accessToken) {
      request.user = null;
      return true;
    }
    const payload = this.jwtService.decode(accessToken) as {
      userId?: string;
    } | null;
    if (!payload?.userId) {
      request.user = null;
      return true;
    }
    request.user = { userId: payload.userId };
    return true;
  }
}
