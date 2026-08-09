import { HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { FieldError } from '../types/view-models';
import { errorFormatter } from './error-formatter';

export const UNKNOWN_FIELD = 'unknown';

const VALIDATION_MESSAGE_FIELD_PATTERN = /^([\w.]+)\s+(.+)$/;
const VALIDATION_MESSAGE_HINT_PATTERN =
  /\b(should|must|cannot|can not|is not|needs to|has to|was|were)\b/i;

function extractFieldFromValidationMessage(message: string): string | null {
  const match = message.match(VALIDATION_MESSAGE_FIELD_PATTERN);
  if (!match) {
    return null;
  }

  const [, field, rest] = match;
  if (!VALIDATION_MESSAGE_HINT_PATTERN.test(rest)) {
    return null;
  }

  return field;
}

function isValidationErrorLike(
  value: unknown,
): value is Pick<ValidationError, 'property' | 'constraints' | 'children'> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'property' in value &&
    typeof (value as ValidationError).property === 'string'
  );
}

function normalizeStructuredError(item: unknown): FieldError | null {
  if (!item || typeof item !== 'object' || !('message' in item)) {
    return null;
  }

  const structured = item as { message: unknown; field?: unknown };
  const message = String(structured.message);
  const field =
    structured.field === null || structured.field === undefined || structured.field === ''
      ? (extractFieldFromValidationMessage(message) ?? UNKNOWN_FIELD)
      : String(structured.field);

  return { message, field };
}

function mapFormattedValidationErrors(errors: ValidationError[]): FieldError[] {
  return errorFormatter(errors).map(({ message, field }) =>
    normalizeDomainFieldError(message, field),
  );
}

function normalizeValidationError(item: unknown): FieldError | null {
  if (!isValidationErrorLike(item)) {
    return null;
  }

  const formatted = mapFormattedValidationErrors([item as ValidationError]);
  return formatted[0] ?? null;
}

function normalizeRawMessage(message: string): FieldError {
  return {
    message,
    field: extractFieldFromValidationMessage(message) ?? UNKNOWN_FIELD,
  };
}

function normalizeRawPayload(raw: unknown): FieldError[] {
  if (Array.isArray(raw)) {
    if (raw.length > 0 && raw.every(isValidationErrorLike)) {
      return mapFormattedValidationErrors(raw as ValidationError[]);
    }

    return raw.map((item) => {
      return (
        normalizeStructuredError(item) ??
        normalizeValidationError(item) ??
        normalizeRawMessage(String(item))
      );
    });
  }

  if (typeof raw === 'string') {
    return [normalizeRawMessage(raw)];
  }

  return [normalizeRawMessage('Bad Request')];
}

export function normalizeHttpExceptionErrors(exception: HttpException): FieldError[] {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return [normalizeRawMessage(response)];
  }

  if (typeof response !== 'object' || response === null) {
    return [normalizeRawMessage('Bad Request')];
  }

  const responseObject = response as Record<string, unknown>;
  const message = responseObject.message;

  if (message !== undefined) {
    return normalizeRawPayload(message);
  }

  return normalizeRawPayload(response);
}

export function normalizeDomainFieldError(message: string, field: string | null): FieldError {
  return {
    message,
    field: field ?? extractFieldFromValidationMessage(message) ?? UNKNOWN_FIELD,
  };
}
