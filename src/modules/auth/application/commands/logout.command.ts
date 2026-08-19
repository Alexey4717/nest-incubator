import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Notification } from '@/core/notification/notification';
import { TypedCommand } from '@/core/types/cqrs-augmentation';

import { IRefreshTokenJwtPayload } from '../../models/refresh-token-jwt-payload.model';
import { LogoutUseCase } from '../use-cases/logout.use-case';

type LogoutInput = {
  userId: string;
  refreshTokenJWTPayload: IRefreshTokenJwtPayload;
};

export class LogoutCommand extends TypedCommand<Notification<null>> {
  constructor(public readonly input: LogoutInput) {
    super();
  }
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, Notification<null>> {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  execute(command: LogoutCommand): Promise<Notification<null>> {
    return this.logoutUseCase.execute(command.input);
  }
}
