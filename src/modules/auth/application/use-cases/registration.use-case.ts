import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { notificationToDomainException } from '@/core/notification/notification-to-domain';
import { IUseCase } from '@/core/types/use-case';

import { RegisterUserCommand } from '@/modules/user/application/commands/register-user.command';

type RegistrationInput = {
  login: string;
  email: string;
  password: string;
};

@Injectable()
export class RegistrationUseCase implements IUseCase<RegistrationInput, void> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(input: RegistrationInput): Promise<void> {
    notificationToDomainException(await this.commandBus.execute(new RegisterUserCommand(input)));
  }
}
