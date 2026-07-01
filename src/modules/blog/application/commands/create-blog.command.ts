import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { GetBlogOutputModelFromMongoDB } from '../../models/GetBlogOutputModel';
import { CreateBlogUseCase } from '../use-cases/create-blog.use-case';

export class CreateBlogCommand extends TypedCommand<GetBlogOutputModelFromMongoDB> {
  constructor(public readonly input: CreateBlogDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<
  CreateBlogCommand,
  GetBlogOutputModelFromMongoDB
> {
  constructor(private readonly createBlogUseCase: CreateBlogUseCase) {}

  execute(command: CreateBlogCommand): Promise<GetBlogOutputModelFromMongoDB> {
    return this.createBlogUseCase.execute(command.input);
  }
}
