import { INestApplication, ValidationPipe } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { errorFormatter } from '@/core/errors/error-formatter';
import { Notification } from '@/core/notification/notification';
import { notificationToDomainException } from '@/core/notification/notification-to-domain';

export function setupValidationPipe(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
      stopAtFirstError: false,
      whitelist: true,
      exceptionFactory: (errors) => {
        notificationToDomainException(
          Notification.fail(DomainExceptionCode.ValidationError, errorFormatter(errors)),
        );
      },
    }),
  );
}
