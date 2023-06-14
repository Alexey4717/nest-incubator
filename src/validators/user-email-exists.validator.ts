import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserQueryRepository } from '../modules/user/infrastructure/user-query.repository';

@ValidatorConstraint({ name: 'UserEmailExists', async: true })
@Injectable()
export class UserEmailExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async validate(email: string) {
    try {
      const user = await this.userQueryRepository.findUserByEmail(email);
      if (user) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'This email already exists';
  }
}
