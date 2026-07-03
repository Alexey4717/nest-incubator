import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { TerminateOtherDevicesUseCase } from '../use-cases/terminate-other-devices.use-case';

type TerminateOtherDevicesInput = {
  userId: string;
  deviceId: string;
};

export class TerminateOtherDevicesCommand extends TypedCommand<void> {
  constructor(public readonly input: TerminateOtherDevicesInput) {
    super();
  }
}

@CommandHandler(TerminateOtherDevicesCommand)
export class TerminateOtherDevicesHandler implements ICommandHandler<
  TerminateOtherDevicesCommand,
  void
> {
  constructor(private readonly terminateOtherDevicesUseCase: TerminateOtherDevicesUseCase) {}

  execute(command: TerminateOtherDevicesCommand): Promise<void> {
    return this.terminateOtherDevicesUseCase.execute(command.input);
  }
}
