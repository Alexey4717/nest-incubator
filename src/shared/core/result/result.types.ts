import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { Extension } from '@/shared/core/exceptions/extension.type';

export enum ResultStatus {
  Success = 'Success',
  Failure = 'Failure',
}

export type ExtensionType = Extension;

export type Result<T> =
  | {
      status: ResultStatus.Success;
      data: T;
    }
  | {
      status: ResultStatus.Failure;
      code: DomainExceptionCode;
      extensions: ExtensionType[];
    };
