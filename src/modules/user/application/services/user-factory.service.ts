import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { UserModel } from '../../models/user.model';
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
  }: CreateUserInput): Promise<UserModel> {
    const passwordHash = await this.passwordHasher.hash(password);
    return {
      id: randomUUID(),
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      confirmationCode: randomUUID(),
      confirmationExpiration: add(new Date(), { hours: 1 }),
      isConfirmed,
      recoveryCode: null,
      recoveryExpiration: null,
    };
  }
}
