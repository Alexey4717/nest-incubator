import { Injectable } from '@nestjs/common';

import { BcryptService } from '@/core/services/bcrypt.service';
import { IUseCase } from '@/core/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserModel } from '../../models/user.model';

type CheckCredentialsInput = {
  loginOrEmail: string;
  password: string;
};

@Injectable()
export class CheckCredentialsUseCase implements IUseCase<CheckCredentialsInput, UserModel | null> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ loginOrEmail, password }: CheckCredentialsInput): Promise<UserModel | null> {
    const foundUser = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!foundUser || !foundUser.passwordHash) return null;
    if (!foundUser.isConfirmed) return null;
    const passwordIsValid = await this.bcryptService.compare(password, foundUser.passwordHash);
    if (!passwordIsValid) return null;
    return foundUser;
  }
}
