import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { BcryptService } from '@/shared/core/application/bcrypt.service';

import { UserModel } from '../../models/user.model';

type CreateUserInput = {
  login: string;
  email: string;
  password: string;
  isConfirmed: boolean;
};

@Injectable()
export class UserFactoryService {
  constructor(private readonly bcryptService: BcryptService) {}

  async createNewUser({
    login,
    email,
    password,
    isConfirmed,
  }: CreateUserInput): Promise<UserModel> {
    const passwordHash = await this.bcryptService.generateHash(password);
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
