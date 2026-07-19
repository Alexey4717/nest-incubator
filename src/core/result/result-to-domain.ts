import { DomainException } from '@/core/exceptions/domain.exception';

import { Result, ResultStatus } from './result.types';

export function resultToDomainException<T>(result: Result<T>): T {
  if (result.status === ResultStatus.Success) {
    return result.data;
  }

  throw new DomainException(result.code, result.extensions);
}
