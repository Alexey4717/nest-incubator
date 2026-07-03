import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function validateConfig<T extends object>(
  config: Record<string, unknown>,
  configClass: new () => T,
): T {
  const validatedConfig = plainToInstance(configClass, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export function convertToBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined) {
    return false;
  }

  return value === 'true' || value === '1';
}

export function getEnumValues<T extends Record<string, string | number>>(
  enumObj: T,
): Array<T[keyof T]> {
  return Object.values(enumObj).filter(
    (value) => typeof value === 'string' || typeof value === 'number',
  ) as Array<T[keyof T]>;
}

/** Применяет validateConfig и копирует результат в Injectable config-класс с конструктором. */
export function applyValidatedConfig<T extends object>(
  target: T,
  config: Record<string, unknown>,
  configClass: new () => T,
): void {
  Object.assign(target, validateConfig(config, configClass));
}
