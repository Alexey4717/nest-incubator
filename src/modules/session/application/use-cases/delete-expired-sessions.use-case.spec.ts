import { Test, TestingModule } from '@nestjs/testing';

import { Notification } from '@/core/notification/notification';

import { SessionRepository } from '../../infrastructure/session.repository';
import { SessionConfig } from '../../session.config';
import { DeleteExpiredSessionsUseCase } from './delete-expired-sessions.use-case';

describe('DeleteExpiredSessionsUseCase', () => {
  let useCase: DeleteExpiredSessionsUseCase;
  let sessionRepository: { deleteAllExpiredSessions: jest.Mock };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

    sessionRepository = { deleteAllExpiredSessions: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteExpiredSessionsUseCase,
        { provide: SessionConfig, useValue: { REFRESH_TOKEN_LIFE_TIME: 3600 } },
        { provide: SessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get(DeleteExpiredSessionsUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deletes sessions older than refresh token lifetime', async () => {
    const result = await useCase.execute();

    expect(sessionRepository.deleteAllExpiredSessions).toHaveBeenCalledWith(
      '2024-01-01T11:00:00.000Z',
    );
    expect(result).toEqual(Notification.ok(null));
  });

  it('handleCron delegates to execute', async () => {
    await expect(useCase.handleCron()).resolves.toEqual(Notification.ok(null));
    expect(sessionRepository.deleteAllExpiredSessions).toHaveBeenCalled();
  });
});
