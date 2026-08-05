import { NextFunction, Request, Response } from 'express';

function normalizeQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0]);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return undefined;
    }

    return trimmed;
  }

  return value;
}

/** Нормализует query до ValidationPipe: массивы → первый элемент, пустые строки удаляются. */
export function normalizeQueryMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const query = req.query;

  if (!query || typeof query !== 'object') {
    next();
    return;
  }

  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    const normalizedValue = normalizeQueryValue(value);

    if (normalizedValue !== undefined) {
      normalized[key] = normalizedValue;
    }
  }

  req.query = normalized as Request['query'];
  next();
}
