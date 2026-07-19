import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdatePostDto } from '../../dto/update-post.dto';
import { UpdatePostUseCase } from '../use-cases/update-post.use-case';

export class UpdatePostCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly id: string,
    public readonly input: UpdatePostDto,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand, ResultType<null>> {
  constructor(private readonly updatePostUseCase: UpdatePostUseCase) {}

  execute(command: UpdatePostCommand): Promise<ResultType<null>> {
    return this.updatePostUseCase.execute({ id: command.id, input: command.input });
  }
}
