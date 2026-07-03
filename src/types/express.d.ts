import { IAuthenticatedUser } from '@/modules/auth/models/authenticated-user.model';
import { IRefreshTokenJwtPayload } from '@/modules/auth/models/refresh-token-jwt-payload.model';

declare global {
  namespace Express {
    interface User extends IAuthenticatedUser {}
    interface Request {
      refreshTokenJWTPayload?: IRefreshTokenJwtPayload;
    }
  }
}
