import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { errorFormatter } from '@/core/errors/error-formatter';
import { Notification } from '@/core/notification/notification';
import { notificationToDomainException } from '@/core/notification/notification-to-domain';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const loginDto = plainToInstance(LoginDto, request.body);
    const errors = await validate(loginDto, {
      whitelist: true,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      notificationToDomainException(
        Notification.fail(DomainExceptionCode.ValidationError, errorFormatter(errors)),
      );
    }

    return (await super.canActivate(context)) as boolean;
  }
}
