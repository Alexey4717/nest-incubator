import { validateOrReject, ValidationError } from 'class-validator';

import { DomainExceptionCode } from '../errors/domain-exception-code.enum';
import { DomainException } from '../errors/domain.exception';
import { errorFormatter } from '../errors/error-formatter';

export const validateOrRejectModel = async (
  model: object,
  classConstructor: { new (): object },
  errorPlace: string,
): Promise<void> => {
  if (model instanceof classConstructor === false) {
    throw new DomainException(DomainExceptionCode.InternalServerError, [
      {
        field: null,
        message: `${errorPlace}: inputModel not instanceof ${classConstructor.name}`,
      },
    ]);
  }

  try {
    await validateOrReject(model);
  } catch (error: unknown) {
    if (Array.isArray(error) && error.every((item) => item instanceof ValidationError)) {
      throw new DomainException(DomainExceptionCode.ValidationError, errorFormatter(error));
    }

    throw error instanceof Error ? error : new Error(String(error));
  }
};
