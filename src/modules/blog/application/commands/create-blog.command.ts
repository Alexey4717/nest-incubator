import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { BlogModel } from '../../models/blog.model';
import { CreateBlogUseCase } from '../use-cases/create-blog.use-case';

export class CreateBlogCommand extends TypedCommand<Notification<BlogModel>> {
  constructor(public readonly input: CreateBlogDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<
  CreateBlogCommand,
  Notification<BlogModel>
> {
  constructor(private readonly createBlogUseCase: CreateBlogUseCase) {}

  execute(command: CreateBlogCommand): Promise<Notification<BlogModel>> {
    return this.createBlogUseCase.execute(command.input);
  }
}
