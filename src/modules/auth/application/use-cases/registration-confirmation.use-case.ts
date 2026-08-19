import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { ConfirmEmailCommand } from '@/modules/user/application/commands/confirm-email.command';

@Injectable()
export class RegistrationConfirmationUseCase implements IUseCase<string, void> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(code: string): Promise<void> {
    notificationToDomainException(await this.commandBus.execute(new ConfirmEmailCommand(code)));
  }
}
