import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDeviceId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (request.deviceId != null) return request.deviceId;
  return request.user?.deviceId ?? null;
});
