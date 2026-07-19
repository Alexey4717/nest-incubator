import { INestApplication, ValidationPipe } from '@nestjs/common';

import { DomainExceptionCode } from '@/shared/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/shared/core/exceptions/domain.exception';
import { errorFormatter } from '@/shared/utils/error-formatter';

export function setupValidationPipe(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        throw new DomainException(DomainExceptionCode.ValidationError, errorFormatter(errors));
      },
    }),
  );
}
