import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { BlogModel } from '../../models/blog.model';
import { CreateBlogUseCase } from '../use-cases/create-blog.use-case';

export class CreateBlogCommand extends TypedCommand<BlogModel> {
  constructor(public readonly input: CreateBlogDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand, BlogModel> {
  constructor(private readonly createBlogUseCase: CreateBlogUseCase) {}

  execute(command: CreateBlogCommand): Promise<BlogModel> {
    return this.createBlogUseCase.execute(command.input);
  }
}
