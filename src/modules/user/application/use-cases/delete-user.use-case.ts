import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class DeleteUserUseCase implements IUseCase<string, ResultType<null>> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<ResultType<null>> {
    const deleted = await this.userRepository.deleteUserById(id);
    if (!deleted) {
      return Result.fail(DomainExceptionCode.NotFound);
    }

    return Result.ok(null);
  }
}
