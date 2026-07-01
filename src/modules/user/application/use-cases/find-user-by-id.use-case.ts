import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { UserQueryRepository } from '../../infrastructure/user-query.repository.mongodb';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';

@Injectable()
export class FindUserByIdUseCase implements IUseCase<string, GetUserOutputModelFromMongoDB | null> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(id: string): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.userQueryRepository.findUserById(id);
  }
}
