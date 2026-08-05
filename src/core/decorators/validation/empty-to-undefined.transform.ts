import { TransformFnParams } from 'class-transformer';

export function emptyToUndefined({ value }: TransformFnParams): unknown {
  return value === '' ? undefined : value;
}

export function queryParamToIntWithDefault(defaultValue: number) {
  return ({ value }: TransformFnParams): number => {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }

    return Number(value);
  };
}

export function queryParamToStringWithDefault<T extends string>(defaultValue: T) {
  return ({ value }: TransformFnParams): T => {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }

    return value as T;
  };
}
