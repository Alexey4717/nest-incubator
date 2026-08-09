import { ArgumentsHost, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

import { CoreConfig } from '../core.config';
import { AllHttpExceptionsFilter } from './all-http-exceptions.filter';

describe('AllHttpExceptionsFilter', () => {
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

    return { host, response };
  };

  it('formats BadRequestException as errorsMessages', () => {
    const filter = new AllHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost();

    filter.catch(
      new BadRequestException({
        message: [{ message: 'should not be empty', field: 'login' }],
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      errorsMessages: [{ message: 'should not be empty', field: 'login' }],
    });
  });

  it('maps other HttpException to statusCode payload', () => {
    const filter = new AllHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost('/users');

    filter.catch(new HttpException('Forbidden', HttpStatus.FORBIDDEN), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        path: '/users',
        timestamp: expect.any(String),
      }),
    );
  });

  it('returns stack for unknown errors in non-production', () => {
    const filter = new AllHttpExceptionsFilter({ isProduction: false } as CoreConfig);
    const { host, response } = createHost();
    const error = new Error('unexpected');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.send).toHaveBeenCalledWith({
      error: error.toString(),
      stack: error.stack,
    });
  });

  it('hides unknown errors in production', () => {
    const filter = new AllHttpExceptionsFilter({ isProduction: true } as CoreConfig);
    const { host, response } = createHost();

    filter.catch('raw failure', host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.send).toHaveBeenCalledWith('Internal Error');
  });
});
