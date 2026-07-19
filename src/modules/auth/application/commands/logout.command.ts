import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';
import { LogoutUseCase } from '../use-cases/logout.use-case';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

export class LogoutCommand extends TypedCommand<boolean> {
  constructor(public readonly input: LogoutInput) {
    super();
  }
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, boolean> {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  execute(command: LogoutCommand): Promise<boolean> {
    return this.logoutUseCase.execute(command.input);
  }
}
