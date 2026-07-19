import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { UpdateBlogUseCase } from '../use-cases/update-blog.use-case';

export class UpdateBlogCommand extends TypedCommand<ResultType<null>> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateBlogDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand, ResultType<null>> {
  constructor(private readonly updateBlogUseCase: UpdateBlogUseCase) {}

  execute(command: UpdateBlogCommand): Promise<ResultType<null>> {
    return this.updateBlogUseCase.execute({ id: command.id, input: command.input });
  }
}
