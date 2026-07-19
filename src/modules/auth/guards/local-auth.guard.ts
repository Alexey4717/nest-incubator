import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code.enum';
import { DomainException } from '@/core/exceptions/domain.exception';
import { errorFormatter } from '@/core/utils/error-formatter';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const loginDto = plainToInstance(LoginDto, request.body);
    const errors = await validate(loginDto, {
      whitelist: true,
      stopAtFirstError: true,
    });

    if (errors.length > 0) {
      throw new DomainException(DomainExceptionCode.ValidationError, errorFormatter(errors));
    }

    return (await super.canActivate(context)) as boolean;
  }
}
