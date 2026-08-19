import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { TerminateOtherDevicesUseCase } from '../use-cases/terminate-other-devices.use-case';

type TerminateOtherDevicesInput = {
  userId: string;
  deviceId: string;
};

export class TerminateOtherDevicesCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly input: TerminateOtherDevicesInput) {
    super();
  }
}

@CommandHandler(TerminateOtherDevicesCommand)
export class TerminateOtherDevicesHandler implements ICommandHandler<
  TerminateOtherDevicesCommand,
  Notification<null>
> {
  constructor(private readonly terminateOtherDevicesUseCase: TerminateOtherDevicesUseCase) {}

  execute(command: TerminateOtherDevicesCommand): Promise<Notification<null>> {
    return this.terminateOtherDevicesUseCase.execute(command.input);
  }
}
