import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SecurityDeviceViewDto } from '@/core/swagger/security-device-view.dto';

const UNAUTHORIZED_DESCRIPTION = 'Invalid refresh token';

export function ApiGetDevices() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns all active sessions (devices) for current user' }),
    ApiOkResponse({ type: [SecurityDeviceViewDto] }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiTerminateOtherDevices() {
  return applyDecorators(
    ApiOperation({ summary: 'Terminate all other sessions except current' }),
    ApiNoContentResponse({ description: 'Other sessions terminated' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}

export function ApiTerminateDevice() {
  return applyDecorators(
    ApiOperation({ summary: 'Terminate session by device id' }),
    ApiParam({ name: 'deviceId', description: 'Device id' }),
    ApiNoContentResponse({ description: 'Session terminated' }),
    ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION }),
  );
}
