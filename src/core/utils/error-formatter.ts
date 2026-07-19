import { ValidationError } from 'class-validator';

import { Extension } from '@/core/exceptions/extension.type';

export function errorFormatter(errors: ValidationError[], parentField = ''): Extension[] {
  const result: Extension[] = [];

  for (const error of errors) {
    const field = parentField ? `${parentField}.${error.property}` : error.property;

    if (error.constraints) {
      const constraintMessages = Object.values(error.constraints);
      if (constraintMessages.length > 0) {
        result.push({
          field,
          message: String(constraintMessages[0]),
        });
      }
    }

    if (error.children?.length) {
      result.push(...errorFormatter(error.children, field));
    }
  }

  return result;
}
