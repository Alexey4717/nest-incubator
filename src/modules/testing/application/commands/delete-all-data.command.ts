import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteAllDataUseCase } from '../use-cases/delete-all-data.use-case';

export class DeleteAllDataCommand extends TypedCommand<Notification<null>> {}

@CommandHandler(DeleteAllDataCommand)
export class DeleteAllDataHandler implements ICommandHandler<
  DeleteAllDataCommand,
  Notification<null>
> {
  constructor(private readonly deleteAllDataUseCase: DeleteAllDataUseCase) {}

  execute(): Promise<Notification<null>> {
    return this.deleteAllDataUseCase.execute();
  }
}
