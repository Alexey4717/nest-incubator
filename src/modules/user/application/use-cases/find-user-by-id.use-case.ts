import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserModel } from '../../models/user.model';

@Injectable()
export class FindUserByIdUseCase implements IUseCase<string, UserModel | null> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(id: string): Promise<UserModel | null> {
    return this.userQueryRepository.findUserById(id);
  }
}
