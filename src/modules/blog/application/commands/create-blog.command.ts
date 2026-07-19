import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { BlogModel } from '../../models/blog.model';
import { CreateBlogUseCase } from '../use-cases/create-blog.use-case';

export class CreateBlogCommand extends TypedCommand<ResultType<BlogModel>> {
  constructor(public readonly input: CreateBlogDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<
  CreateBlogCommand,
  ResultType<BlogModel>
> {
  constructor(private readonly createBlogUseCase: CreateBlogUseCase) {}

  execute(command: CreateBlogCommand): Promise<ResultType<BlogModel>> {
    return this.createBlogUseCase.execute(command.input);
  }
}
