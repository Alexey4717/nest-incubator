import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { SessionEntity } from '../../domain/entities/session.entity';
import { fromEntity } from '../../infrastructure/session.mapper';
import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionModel } from '../../models/session.model';

@Injectable()
export class CreateSessionUseCase implements IUseCase<SessionModel, SessionModel> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(newSession: SessionModel): Promise<SessionModel> {
    const session = SessionEntity.create(newSession);
    const saved = await this.sessionRepository.createNewSession(session);
    return fromEntity(saved);
  }
}
