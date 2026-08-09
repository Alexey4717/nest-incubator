import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionModel } from '../../models/session.model';
import { CreateSessionUseCase } from './create-session.use-case';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let sessionRepository: { createNewSession: jest.Mock };

  const sessionInput: SessionModel = {
    userId: 'user-1',
    deviceId: 'device-1',
    ip: '127.0.0.1',
    title: 'Chrome',
    lastActiveDate: '2024-01-01T00:00:00.000Z',
    currentRefreshTokenJti: 'jti-1',
  };

  beforeEach(async () => {
    sessionRepository = { createNewSession: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionUseCase,
        { provide: SessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get(CreateSessionUseCase);
  });

  it('creates session and returns Result.ok', async () => {
    const saved = SessionEntity.create(sessionInput);
    sessionRepository.createNewSession.mockResolvedValue(saved);

    const result = await useCase.execute(sessionInput);

    expect(result.status).toBe(ResultStatus.Success);
    if (result.status === ResultStatus.Success) {
      expect(result.data).toMatchObject({
        userId: 'user-1',
        deviceId: 'device-1',
        ip: '127.0.0.1',
        title: 'Chrome',
        currentRefreshTokenJti: 'jti-1',
      });
    }
    expect(sessionRepository.createNewSession).toHaveBeenCalledTimes(1);
  });

  it('throws InternalServerError when repository fails', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    sessionRepository.createNewSession.mockRejectedValue(new Error('db error'));

    await expect(useCase.execute(sessionInput)).rejects.toEqual(
      new DomainException(DomainExceptionCode.InternalServerError),
    );

    consoleSpy.mockRestore();
  });
});
