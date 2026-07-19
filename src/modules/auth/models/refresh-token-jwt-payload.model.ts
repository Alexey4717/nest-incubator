export class IRefreshTokenJwtPayload {
  userId: string;
  deviceId: string;
  jti: string;
  iat: number;
}
