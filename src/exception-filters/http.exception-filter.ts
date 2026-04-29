import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { constants } from 'http2';
import * as process from 'process';

/** Разбираем тело BadRequestException / Validation Pipe в массив { message, field } для errorsMessages */
function normalizeBadRequestMessages(exception: HttpException): {
  message: string;
  field: string;
}[] {
  const response = exception.getResponse();

  let raw: unknown;
  if (typeof response === 'string') {
    return [{ message: response, field: 'email' }];
  }

  raw =
    typeof response === 'object' && response !== null
      ? (response as Record<string, unknown>).message
      : undefined;

  if (raw === undefined && typeof response === 'object' && response !== null) {
    raw = response;
  }

  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        'message' in item &&
        'field' in item
      ) {
        const o = item as { message: string; field: string };
        return { message: String(o.message), field: String(o.field) };
      }
      return {
        message: String(item),
        field: 'email',
      };
    });
  }

  if (typeof raw === 'string') {
    return [{ message: raw, field: 'email' }];
  }

  return [{ message: 'Bad Request', field: 'email' }];
}

// для подсказок в режиме разработки где упала ошибка
@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    void context.getRequest<Request>();

    // catching all internal server errors (500)
    if (process.env.NODE_ENV !== 'production') {
      response.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: exception.toString(),
        stack: exception.stack,
      });
    } else {
      response
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send('Internal Error');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();

    if (status === constants.HTTP_STATUS_BAD_REQUEST) {
      const errorsMessages = normalizeBadRequestMessages(exception);
      response.status(status).json({
        errorsMessages,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
