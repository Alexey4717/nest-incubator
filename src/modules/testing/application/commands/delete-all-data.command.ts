import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteAllDataUseCase } from '../use-cases/delete-all-data.use-case';

export class DeleteAllDataCommand {}

@CommandHandler(DeleteAllDataCommand)
export class DeleteAllDataHandler implements ICommandHandler<DeleteAllDataCommand> {
  constructor(private readonly deleteAllDataUseCase: DeleteAllDataUseCase) {}

  execute(): Promise<boolean> {
    return this.deleteAllDataUseCase.execute();
  }
}
