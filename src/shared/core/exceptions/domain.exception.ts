import { DomainExceptionCode } from './domain-exception-code.enum';
import { Extension } from './extension.type';

export class DomainException extends Error {
  constructor(
    public readonly code: DomainExceptionCode,
    public readonly extensions: Extension[] = [],
  ) {
    super(code);
  }
}
