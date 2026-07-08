import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionModel } from '../../models/session.model';

@Injectable()
export class CreateSessionUseCase implements IUseCase<SessionModel, SessionModel> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(newSession: SessionModel): Promise<SessionModel> {
    return this.sessionRepository.createNewSession(newSession);
  }
}
