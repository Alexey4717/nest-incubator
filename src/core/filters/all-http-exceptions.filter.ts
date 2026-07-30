import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { constants } from 'http2';

import { CoreConfig } from '@/core/core.config';
import { normalizeHttpExceptionErrors } from '@/core/utils/normalize-http-exception-errors';

function sendHttpExceptionResponse(exception: HttpException, host: ArgumentsHost): void {
  const context = host.switchToHttp();
  const response = context.getResponse<Response>();
  const request = context.getRequest<Request>();
  const status = exception.getStatus();

  if (status === constants.HTTP_STATUS_BAD_REQUEST) {
    const errorsMessages = normalizeHttpExceptionErrors(exception);
    response.status(status).json({
      errorsMessages,
    });
    return;
  }

  response.status(status).json({
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: request.url,
  });
}

@Injectable()
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private readonly coreConfig: CoreConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      sendHttpExceptionResponse(exception, host);
      return;
    }

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const error = exception instanceof Error ? exception : new Error(String(exception));

    if (!this.coreConfig.isProduction) {
      response.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: error.toString(),
        stack: error.stack,
      });
      return;
    }

    response.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Internal Error');
  }
}
