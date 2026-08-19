import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { UpdateBlogUseCase } from '../use-cases/update-blog.use-case';

export class UpdateBlogCommand extends TypedCommand<Notification<null>> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateBlogDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand, Notification<null>> {
  constructor(private readonly updateBlogUseCase: UpdateBlogUseCase) {}

  execute(command: UpdateBlogCommand): Promise<Notification<null>> {
    return this.updateBlogUseCase.execute({ id: command.id, input: command.input });
  }
}
