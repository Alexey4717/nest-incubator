import { BadRequestException } from '@nestjs/common';

import {
  normalizeDomainFieldError,
  normalizeHttpExceptionErrors,
  UNKNOWN_FIELD,
} from './normalize-http-exception-errors';

describe('normalizeHttpExceptionErrors', () => {
  it('extracts field from class-validator message strings', () => {
    const exception = new BadRequestException('email should not be empty');

    expect(normalizeHttpExceptionErrors(exception)).toEqual([
      {
        field: 'email',
        message: 'email should not be empty',
      },
    ]);
  });

  it('uses unknown field for generic bad request messages', () => {
    const exception = new BadRequestException('Bad Request');

    expect(normalizeHttpExceptionErrors(exception)).toEqual([
      {
        field: UNKNOWN_FIELD,
        message: 'Bad Request',
      },
    ]);
  });

  it('keeps explicit field from structured errors', () => {
    const exception = new BadRequestException({
      message: [{ message: 'Confirmation code incorrect', field: 'code' }],
    });

    expect(normalizeHttpExceptionErrors(exception)).toEqual([
      {
        field: 'code',
        message: 'Confirmation code incorrect',
      },
    ]);
  });

  it('formats validation error objects from NestJS response', () => {
    const exception = new BadRequestException({
      message: [
        {
          property: 'login',
          children: [],
          constraints: {
            isNotEmpty: 'login should not be empty',
          },
        },
      ],
    });

    expect(normalizeHttpExceptionErrors(exception)).toEqual([
      {
        field: 'login',
        message: 'login should not be empty',
      },
    ]);
  });

  it('extracts field from structured error without field when message looks like validation error', () => {
    const exception = new BadRequestException({
      message: [{ message: 'password must be longer than or equal to 8 characters' }],
    });

    expect(normalizeHttpExceptionErrors(exception)).toEqual([
      {
        field: 'password',
        message: 'password must be longer than or equal to 8 characters',
      },
    ]);
  });
});

describe('normalizeDomainFieldError', () => {
  it('uses explicit field when provided', () => {
    expect(normalizeDomainFieldError('email already confirmed', 'email')).toEqual({
      field: 'email',
      message: 'email already confirmed',
    });
  });

  it('extracts field from validation-like message when field is missing', () => {
    expect(normalizeDomainFieldError('login should not be empty', null)).toEqual({
      field: 'login',
      message: 'login should not be empty',
    });
  });

  it('falls back to unknown for non-validation messages without field', () => {
    expect(normalizeDomainFieldError('Confirmation code incorrect', null)).toEqual({
      field: UNKNOWN_FIELD,
      message: 'Confirmation code incorrect',
    });
  });
});
