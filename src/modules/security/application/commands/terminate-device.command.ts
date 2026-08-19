import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { TerminateDeviceUseCase } from '../use-cases/terminate-device.use-case';

type TerminateDeviceInput = {
  userId: string;
  deviceId: string;
};

export class TerminateDeviceCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly input: TerminateDeviceInput) {
    super();
  }
}

@CommandHandler(TerminateDeviceCommand)
export class TerminateDeviceHandler implements ICommandHandler<
  TerminateDeviceCommand,
  Notification<null>
> {
  constructor(private readonly terminateDeviceUseCase: TerminateDeviceUseCase) {}

  execute(command: TerminateDeviceCommand): Promise<Notification<null>> {
    return this.terminateDeviceUseCase.execute(command.input);
  }
}
