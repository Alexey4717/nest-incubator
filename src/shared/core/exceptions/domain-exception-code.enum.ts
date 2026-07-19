export enum DomainExceptionCode {
  BadRequest = 'BadRequest',
  ValidationError = 'ValidationError',
  NotFound = 'NotFound',
  Forbidden = 'Forbidden',
  Unauthorized = 'Unauthorized',
  InternalServerError = 'InternalServerError',
  ConfirmationCodeExpired = 'ConfirmationCodeExpired',
  EmailNotConfirmed = 'EmailNotConfirmed',
  PasswordRecoveryCodeExpired = 'PasswordRecoveryCodeExpired',
}
