import { DomainExceptionCode } from '../exceptions/domain-exception-code.enum';
import { Extension } from '../exceptions/extension.type';

export enum ResultStatus {
  Success = 'Success',
  Failure = 'Failure',
}

export type Result<T> =
  | {
      status: ResultStatus.Success;
      data: T;
    }
  | {
      status: ResultStatus.Failure;
      code: DomainExceptionCode;
      extensions: Extension[];
    };
