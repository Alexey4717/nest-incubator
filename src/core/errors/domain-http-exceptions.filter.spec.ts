import { ArgumentsHost, HttpStatus } from '@nestjs/common';

import { CoreConfig } from '../core.config';
import { DomainExceptionCode } from './domain-exception-code.enum';
import { DomainHttpExceptionsFilter } from './domain-http-exceptions.filter';
import { DomainException } from './domain.exception';

describe('DomainHttpExceptionsFilter', () => {
  const createHost = (url = '/api/test') => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const request = { url };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, response, request };
  };

  it('maps BadRequest DomainException to errorsMessages', () => {
    const filter = new DomainHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost();

    filter.catch(
      new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'login already exists', field: 'login' },
      ]),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      errorsMessages: [{ message: 'login already exists', field: 'login' }],
    });
  });

  it('maps ValidationError and related codes to 400 with errorsMessages', () => {
    const filter = new DomainHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost();

    filter.catch(
      new DomainException(DomainExceptionCode.EmailNotConfirmed, [
        { message: 'email not confirmed', field: 'email' },
      ]),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      errorsMessages: [{ message: 'email not confirmed', field: 'email' }],
    });
  });

  it('maps Unauthorized / Forbidden / NotFound to status payload without errorsMessages', () => {
    const filter = new DomainHttpExceptionsFilter({ isProduction: false } as CoreConfig);

    for (const [code, status] of [
      [DomainExceptionCode.Unauthorized, HttpStatus.UNAUTHORIZED],
      [DomainExceptionCode.Forbidden, HttpStatus.FORBIDDEN],
      [DomainExceptionCode.NotFound, HttpStatus.NOT_FOUND],
    ] as const) {
      const { host, response } = createHost('/path');
      filter.catch(new DomainException(code), host);

      expect(response.status).toHaveBeenCalledWith(status);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: status,
          path: '/path',
          timestamp: expect.any(String),
        }),
      );
    }
  });

  it('returns stack in non-production for InternalServerError', () => {
    const filter = new DomainHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost();
    const exception = new DomainException(DomainExceptionCode.InternalServerError, [
      { message: 'boom', field: null },
    ]);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.send).toHaveBeenCalledWith({
      error: 'boom',
      stack: exception.stack,
    });
  });

  it('hides details in production for InternalServerError', () => {
    const filter = new DomainHttpExceptionsFilter({ isProduction: true } as CoreConfig);
    const { host, response } = createHost();

    filter.catch(new DomainException(DomainExceptionCode.InternalServerError), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.send).toHaveBeenCalledWith('Internal Error');
  });
});
