import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/shared/types/cqrs-augmentation';

import { AuthTokensViewModel } from '../../types/view-models';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';

export class RefreshTokenCommand extends TypedCommand<AuthTokensViewModel | null> {
  constructor(public readonly token: string) {
    super();
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  AuthTokensViewModel | null
> {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  execute(command: RefreshTokenCommand): Promise<AuthTokensViewModel | null> {
    return this.refreshTokenUseCase.execute(command.token);
  }
}
