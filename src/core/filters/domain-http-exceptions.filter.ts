import { ArgumentsHost, Catch, ExceptionFilter, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { constants } from 'http2';

import { CoreConfig } from '@/core/core.config';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';

function getHttpStatus(code: DomainExceptionCode): number {
  switch (code) {
    case DomainExceptionCode.Unauthorized:
      return constants.HTTP_STATUS_UNAUTHORIZED;
    case DomainExceptionCode.Forbidden:
      return constants.HTTP_STATUS_FORBIDDEN;
    case DomainExceptionCode.NotFound:
      return constants.HTTP_STATUS_NOT_FOUND;
    case DomainExceptionCode.InternalServerError:
      return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
    case DomainExceptionCode.BadRequest:
    case DomainExceptionCode.ValidationError:
    case DomainExceptionCode.ConfirmationCodeExpired:
    case DomainExceptionCode.EmailNotConfirmed:
    case DomainExceptionCode.PasswordRecoveryCodeExpired:
      return constants.HTTP_STATUS_BAD_REQUEST;
    default:
      return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
}

function isBadRequestCode(code: DomainExceptionCode): boolean {
  return getHttpStatus(code) === constants.HTTP_STATUS_BAD_REQUEST;
}

@Injectable()
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  constructor(private readonly coreConfig: CoreConfig) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = getHttpStatus(exception.code);

    if (isBadRequestCode(exception.code)) {
      response.status(status).json({
        errorsMessages: exception.extensions.map(({ message, field }) => ({
          message,
          field: field ?? 'email',
        })),
      });
      return;
    }

    if (exception.code === DomainExceptionCode.InternalServerError) {
      const error = exception.extensions[0]?.message ?? exception.message;

      if (!this.coreConfig.isProduction) {
        response.status(status).send({
          error,
          stack: exception.stack,
        });
        return;
      }

      response.status(status).send('Internal Error');
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
