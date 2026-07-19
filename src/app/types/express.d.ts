import { IAuthenticatedUser } from '@/modules/auth/models/authenticated-user.model';
import { IRefreshTokenJwtPayload } from '@/modules/auth/models/refresh-token-jwt-payload.model';

declare global {
  namespace Express {
    type User = IAuthenticatedUser;
    interface Request {
      refreshTokenJWTPayload?: IRefreshTokenJwtPayload;
    }
  }
}
