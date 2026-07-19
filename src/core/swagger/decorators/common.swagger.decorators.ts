import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ValidationErrorResponseDto } from '@/core/swagger/validation-error.dto';

export function ApiValidationError() {
  return applyDecorators(ApiBadRequestResponse({ type: ValidationErrorResponseDto }));
}

export function ApiBearerProtected(description = 'Invalid access token') {
  return applyDecorators(ApiBearerAuth(), ApiUnauthorizedResponse({ description }));
}

export function ApiBasicAdmin(description = 'Invalid basic auth credentials') {
  return applyDecorators(ApiBasicAuth(), ApiUnauthorizedResponse({ description }));
}

export function ApiCookieProtected(description = 'Invalid or missing refresh token') {
  return applyDecorators(ApiCookieAuth('refreshToken'), ApiUnauthorizedResponse({ description }));
}

export function ApiCookieProtectedLogout(description = 'Invalid refresh token') {
  return applyDecorators(ApiCookieAuth('refreshToken'), ApiUnauthorizedResponse({ description }));
}
