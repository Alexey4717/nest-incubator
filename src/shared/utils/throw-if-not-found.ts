import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';

export function throwIfNotFound<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new DomainException(DomainExceptionCode.NotFound);
  }

  return value;
}
