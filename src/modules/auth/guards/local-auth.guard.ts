import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

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
      const message = errors.map((error) => {
        const constraintsKeys = Object.keys(error.constraints ?? {});
        return {
          message: error.constraints?.[constraintsKeys[0]],
          field: error.property,
        };
      });
      throw new BadRequestException({ message, error: 'Bad Request' });
    }

    return (await super.canActivate(context)) as boolean;
  }
}
