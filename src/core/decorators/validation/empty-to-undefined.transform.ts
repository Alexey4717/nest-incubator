import { TransformFnParams } from 'class-transformer';

function unwrapQueryParam(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function emptyToUndefined({ value }: TransformFnParams): unknown {
  const unwrapped = unwrapQueryParam(value);

  return unwrapped === '' ? undefined : unwrapped;
}

export function queryParamToIntWithDefault(defaultValue: number) {
  return ({ value }: TransformFnParams): number => {
    const unwrapped = unwrapQueryParam(value);

    if (unwrapped === '' || unwrapped === null || unwrapped === undefined) {
      return defaultValue;
    }

    return Number(unwrapped);
  };
}

export function queryParamToStringWithDefault<T extends string>(defaultValue: T) {
  return ({ value }: TransformFnParams): T => {
    const unwrapped = unwrapQueryParam(value);

    if (unwrapped === '' || unwrapped === null || unwrapped === undefined) {
      return defaultValue;
    }

    return unwrapped as T;
  };
}
