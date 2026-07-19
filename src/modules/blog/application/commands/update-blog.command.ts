import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { UpdateBlogUseCase } from '../use-cases/update-blog.use-case';

export class UpdateBlogCommand extends TypedCommand<boolean> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateBlogDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand, boolean> {
  constructor(private readonly updateBlogUseCase: UpdateBlogUseCase) {}

  execute(command: UpdateBlogCommand): Promise<boolean> {
    return this.updateBlogUseCase.execute({ id: command.id, input: command.input });
  }
}
