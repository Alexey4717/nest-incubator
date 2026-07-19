import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { Extension } from '@/shared/core/exceptions/extension.type';

import { ResultStatus, Result as ResultType } from './result.types';

export const Result = {
  ok<T>(data: T): ResultType<T> {
    return {
      status: ResultStatus.Success,
      data,
    };
  },

  fail(code: DomainExceptionCode, extensions: Extension[] = []): ResultType<never> {
    return {
      status: ResultStatus.Failure,
      code,
      extensions,
    };
  },
};
