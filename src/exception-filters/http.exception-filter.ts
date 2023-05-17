import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { constants } from 'http2';
import * as process from 'process';

// для подсказок в режиме разработки где упала ошибка
@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // catching all internal server errors (500)
    if (process.env.NODE_ENV !== 'prod') {
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

    // 400
    if (status === constants.HTTP_STATUS_BAD_REQUEST) {
      const errorResponse = {
        errors: [],
      };
      // TODO type
      const exceptionResponse: any = exception.getResponse();
      exceptionResponse.message.forEach(
        (objError: { message: string; field: string }) => {
          errorResponse.errors.push(objError);
        },
      );
      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
