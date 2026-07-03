import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { TerminateDeviceUseCase } from '../use-cases/terminate-device.use-case';

type TerminateDeviceInput = {
  userId: string;
  deviceId: string;
};

export class TerminateDeviceCommand extends TypedCommand<void> {
  constructor(public readonly input: TerminateDeviceInput) {
    super();
  }
}

@CommandHandler(TerminateDeviceCommand)
export class TerminateDeviceHandler implements ICommandHandler<TerminateDeviceCommand, void> {
  constructor(private readonly terminateDeviceUseCase: TerminateDeviceUseCase) {}

  execute(command: TerminateDeviceCommand): Promise<void> {
    return this.terminateDeviceUseCase.execute(command.input);
  }
}
