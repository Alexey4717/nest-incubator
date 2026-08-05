import { TransformFnParams } from 'class-transformer';

function unwrapQueryParam(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeQueryString(value: unknown): unknown {
  const unwrapped = unwrapQueryParam(value);

  if (typeof unwrapped === 'string') {
    return unwrapped.trim();
  }

  return unwrapped;
}

function isEmptyQueryParamValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value === '' || value === 'null' || value === 'undefined';
  }

  return false;
}

export function emptyToUndefined({ value }: TransformFnParams): unknown {
  const normalized = normalizeQueryString(value);

  return isEmptyQueryParamValue(normalized) ? undefined : normalized;
}

export function queryParamToIntWithDefault(defaultValue: number) {
  return ({ value }: TransformFnParams): number => {
    const normalized = normalizeQueryString(value);

    if (isEmptyQueryParamValue(normalized)) {
      return defaultValue;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : defaultValue;
  };
}

export function queryParamToStringWithDefault<T extends string>(defaultValue: T) {
  return ({ value }: TransformFnParams): T => {
    const normalized = normalizeQueryString(value);

    if (isEmptyQueryParamValue(normalized)) {
      return defaultValue;
    }

    return normalized as T;
  };
}
