import { INestApplication, ValidationPipe } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { errorFormatter } from '@/core/errors/error-formatter';

export function setupValidationPipe(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        throw new DomainException(DomainExceptionCode.ValidationError, errorFormatter(errors));
      },
    }),
  );
}
