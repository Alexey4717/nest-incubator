import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  ApiBearerProtected,
  ApiCookieProtected,
  ApiCookieProtectedLogout,
  ApiValidationError,
} from '@/core/swagger/decorators/common.swagger.decorators';

import { AccessTokenViewDto, MeViewDto } from '../dto/auth-view.swagger.dto';
import { LoginDto } from '../dto/login.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { RegistrationEmailResendingDto } from '../dto/registration-email-resending.dto';
import { RegistrationDto } from '../dto/registration.dto';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Try login user into system' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({
      type: AccessTokenViewDto,
      description: 'Returns JWT access token in body and refresh token in cookie',
    }),
    ApiValidationError(),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
}

export function ApiPasswordRecovery() {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery via email' }),
    ApiBody({ type: RecoveryPasswordDto }),
    ApiNoContentResponse({ description: 'Recovery email sent if user exists' }),
    ApiValidationError(),
  );
}

export function ApiNewPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Set new password using recovery code' }),
    ApiBody({ type: NewPasswordDto }),
    ApiNoContentResponse({ description: 'Password updated successfully' }),
    ApiValidationError(),
  );
}

export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate new pair of access and refresh tokens' }),
    ApiCookieProtected(),
    ApiOkResponse({
      type: AccessTokenViewDto,
      description: 'Returns new JWT access token and updates refresh token cookie',
    }),
  );
}

export function ApiRegistration() {
  return applyDecorators(
    ApiOperation({ summary: 'Registration in the system' }),
    ApiBody({ type: RegistrationDto }),
    ApiNoContentResponse({ description: 'Confirmation email sent' }),
    ApiValidationError(),
  );
}

export function ApiRegistrationEmailResending() {
  return applyDecorators(
    ApiOperation({ summary: 'Resend registration confirmation email' }),
    ApiBody({ type: RegistrationEmailResendingDto }),
    ApiNoContentResponse({ description: 'Confirmation email resent' }),
    ApiValidationError(),
  );
}

export function ApiRegistrationConfirmation() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm registration using code from email' }),
    ApiBody({ type: RegistrationConfirmationDto }),
    ApiNoContentResponse({ description: 'Registration confirmed' }),
    ApiValidationError(),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiCookieProtectedLogout(),
    ApiOperation({ summary: 'Terminate all sessions (logout)' }),
    ApiNoContentResponse({ description: 'Logged out successfully' }),
  );
}

export function ApiGetMe() {
  return applyDecorators(
    ApiBearerProtected(),
    ApiOperation({ summary: 'Get information about current user' }),
    ApiOkResponse({ type: MeViewDto }),
    ApiUnauthorizedResponse({ description: 'Invalid access token' }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
}
