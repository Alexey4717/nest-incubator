import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { UpdatePostDto } from '../../dto/update-post.dto';
import { UpdatePostUseCase } from '../use-cases/update-post.use-case';

export class UpdatePostCommand extends TypedCommand<boolean> {
  constructor(
    public readonly id: string,
    public readonly input: UpdatePostDto,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand, boolean> {
  constructor(private readonly updatePostUseCase: UpdatePostUseCase) {}

  execute(command: UpdatePostCommand): Promise<boolean> {
    return this.updatePostUseCase.execute({ id: command.id, input: command.input });
  }
}
