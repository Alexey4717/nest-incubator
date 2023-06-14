import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserQueryRepository } from '../modules/user/infrastructure/user-query.repository';

@ValidatorConstraint({ name: 'UserLoginExists', async: true })
@Injectable()
export class UserLoginExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async validate(login: string) {
    try {
      const user = await this.userQueryRepository.findUserByLogin(login);
      if (user) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'This login already exists';
  }
}
