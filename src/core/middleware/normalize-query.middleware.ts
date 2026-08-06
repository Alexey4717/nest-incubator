import { NextFunction, Request, Response } from 'express';

function normalizeScalarQueryValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return undefined;
    }

    return trimmed;
  }

  return value;
}

function normalizeQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0]);
  }

  return normalizeScalarQueryValue(value);
}

/** Для `sort` сохраняем массив query-параметров (trim + фильтр пустых). */
function normalizeSortQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => normalizeScalarQueryValue(item))
      .filter((item): item is Exclude<typeof item, undefined> => item !== undefined);

    return items.length > 0 ? items : undefined;
  }

  return normalizeScalarQueryValue(value);
}

/** Нормализует query до ValidationPipe: массивы → первый элемент (кроме `sort`), пустые строки удаляются. */
export function normalizeQueryMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const query = req.query;

  if (!query || typeof query !== 'object') {
    next();
    return;
  }

  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    const normalizedValue =
      key === 'sort' ? normalizeSortQueryValue(value) : normalizeQueryValue(value);

    if (normalizedValue !== undefined) {
      normalized[key] = normalizedValue;
    }
  }

  req.query = normalized as Request['query'];
  next();
}
