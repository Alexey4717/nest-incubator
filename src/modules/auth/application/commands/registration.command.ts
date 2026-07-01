import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { RegistrationUseCase } from '../use-cases/registration.use-case';

type RegistrationInput = {
  login: string;
  email: string;
  password: string;
};

export class RegistrationCommand extends TypedCommand<void> {
  constructor(public readonly input: RegistrationInput) {
    super();
  }
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler implements ICommandHandler<RegistrationCommand, void> {
  constructor(private readonly registrationUseCase: RegistrationUseCase) {}

  execute(command: RegistrationCommand): Promise<void> {
    return this.registrationUseCase.execute(command.input);
  }
}
