import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';
import { IUseCase } from '@/core/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class DeleteUserUseCase implements IUseCase<string, Notification<null>> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<Notification<null>> {
    const deleted = await this.userRepository.deleteUserById(id);
    if (!deleted) {
      return Notification.fail(DomainExceptionCode.NotFound);
    }

    return Notification.ok(null);
  }
}
