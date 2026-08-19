import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { ChangePasswordCommand } from '@/modules/user/application/commands/change-password.command';

type NewPasswordInput = {
  recoveryCode: string;
  newPassword: string;
};

@Injectable()
export class NewPasswordUseCase implements IUseCase<NewPasswordInput, void> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(input: NewPasswordInput): Promise<void> {
    notificationToDomainException(await this.commandBus.execute(new ChangePasswordCommand(input)));
  }
}
