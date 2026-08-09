import { Injectable } from '@nestjs/common';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';
import { Result as ResultType } from '@/core/result/result.types';
import { IUseCase } from '@/core/types/use-case';

import { SessionEntity } from '../../domain/entities/session.entity';
import { fromEntity } from '../../infrastructure/session.mapper';
import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionModel } from '../../models/session.model';

@Injectable()
export class CreateSessionUseCase implements IUseCase<SessionModel, ResultType<SessionModel>> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(newSession: SessionModel): Promise<ResultType<SessionModel>> {
    try {
      const session = SessionEntity.create(newSession);
      const saved = await this.sessionRepository.createNewSession(session);
      return Result.ok(fromEntity(saved));
    } catch (error) {
      console.log(`CreateSessionUseCase.execute error is occurred: ${error}`);
      throw new DomainException(DomainExceptionCode.InternalServerError);
    }
  }
}
