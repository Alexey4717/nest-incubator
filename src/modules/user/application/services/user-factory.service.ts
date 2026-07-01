import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { CreateUserInsertToDBModel } from '../../models/CreateUserInsertToDBModel';
import { PasswordHasherService } from './password-hasher.service';

type CreateUserInput = {
  login: string;
  email: string;
  password: string;
  isConfirmed: boolean;
};

@Injectable()
export class UserFactoryService {
  constructor(private readonly passwordHasher: PasswordHasherService) {}

  async createNewUser({
    login,
    email,
    password,
    isConfirmed,
  }: CreateUserInput): Promise<CreateUserInsertToDBModel> {
    const passwordHash = await this.passwordHasher.hash(password);
    return {
      id: randomUUID(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      },
      recoveryData: null,
    };
  }
}
