import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository.mongodb';

@Injectable()
export class DeleteUserUseCase implements IUseCase<string, boolean> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.userRepository.deleteUserById(id);
  }
}
