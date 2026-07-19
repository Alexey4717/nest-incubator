import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { TerminateOtherDevicesUseCase } from '../use-cases/terminate-other-devices.use-case';

type TerminateOtherDevicesInput = {
  userId: string;
  deviceId: string;
};

export class TerminateOtherDevicesCommand extends TypedCommand<ResultType<null>> {
  constructor(public readonly input: TerminateOtherDevicesInput) {
    super();
  }
}

@CommandHandler(TerminateOtherDevicesCommand)
export class TerminateOtherDevicesHandler implements ICommandHandler<
  TerminateOtherDevicesCommand,
  ResultType<null>
> {
  constructor(private readonly terminateOtherDevicesUseCase: TerminateOtherDevicesUseCase) {}

  execute(command: TerminateOtherDevicesCommand): Promise<ResultType<null>> {
    return this.terminateOtherDevicesUseCase.execute(command.input);
  }
}
