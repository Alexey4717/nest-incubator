import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { IUseCase } from '@/shared/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserModel } from '../../models/user.model';

type CheckCredentialsInput = {
  loginOrEmail: string;
  password: string;
};

@Injectable()
export class CheckCredentialsUseCase implements IUseCase<CheckCredentialsInput, UserModel | null> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute({ loginOrEmail, password }: CheckCredentialsInput): Promise<UserModel | null> {
    const foundUser = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser.passwordHash) return null;
    if (!foundUser.isConfirmed) return null;
    const passwordIsValid = await bcrypt.compare(password, foundUser.passwordHash);
    if (!passwordIsValid) return null;
    return foundUser;
  }
}
