import { DomainExceptionCode } from './domain-exception-code.enum';
import { DomainException } from './domain.exception';

export function throwIfNotFound<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new DomainException(DomainExceptionCode.NotFound);
  }

  return value;
}
