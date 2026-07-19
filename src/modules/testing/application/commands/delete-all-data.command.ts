import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { DeleteAllDataUseCase } from '../use-cases/delete-all-data.use-case';

export class DeleteAllDataCommand extends TypedCommand<ResultType<null>> {}

@CommandHandler(DeleteAllDataCommand)
export class DeleteAllDataHandler implements ICommandHandler<
  DeleteAllDataCommand,
  ResultType<null>
> {
  constructor(private readonly deleteAllDataUseCase: DeleteAllDataUseCase) {}

  execute(): Promise<ResultType<null>> {
    return this.deleteAllDataUseCase.execute();
  }
}
