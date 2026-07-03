import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionRepository } from '../../infrastructure/session.repository.mongodb';
import { Session } from '../../models/session.schema';

@Injectable()
export class CreateSessionUseCase implements IUseCase<Session, Session> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(newSession: Session): Promise<Session> {
    return this.sessionRepository.createNewSession(newSession);
  }
}
