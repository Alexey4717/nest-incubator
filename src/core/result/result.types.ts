import { DomainExceptionCode } from '../errors/domain-exception-code.enum';
import { Extension } from '../errors/extension.type';

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
