import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { PairGameViewModel } from '../../models/pair-game.model';
import { ConnectPairGameUseCase } from '../use-cases/connect-pair-game.use-case';

export class ConnectPairGameCommand extends TypedCommand<PairGameViewModel> {
  constructor(public readonly userId: string) {
    super();
  }
}

@CommandHandler(ConnectPairGameCommand)
export class ConnectPairGameHandler implements ICommandHandler<
  ConnectPairGameCommand,
  PairGameViewModel
> {
  constructor(private readonly connectPairGameUseCase: ConnectPairGameUseCase) {}

  execute(command: ConnectPairGameCommand): Promise<PairGameViewModel> {
    return this.connectPairGameUseCase.execute(command.userId);
  }
}
