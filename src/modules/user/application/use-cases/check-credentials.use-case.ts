import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { IUseCase } from '@/shared/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository.mongodb';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';

type CheckCredentialsInput = {
  loginOrEmail: string;
  password: string;
};

@Injectable()
export class CheckCredentialsUseCase implements IUseCase<
  CheckCredentialsInput,
  GetUserOutputModelFromMongoDB | null
> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute({
    loginOrEmail,
    password,
  }: CheckCredentialsInput): Promise<GetUserOutputModelFromMongoDB | null> {
    const foundUser = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser?.accountData?.passwordHash) return null;
    if (!foundUser.emailConfirmation?.isConfirmed) return null;
    const passwordIsValid = await bcrypt.compare(password, foundUser.accountData.passwordHash);
    if (!passwordIsValid) return null;
    return foundUser;
  }
}
