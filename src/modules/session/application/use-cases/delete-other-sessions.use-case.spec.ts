import { Test, TestingModule } from '@nestjs/testing';

import { Notification } from '@/core/notification/notification';

import { SessionRepository } from '../../infrastructure/session.repository';
import { DeleteOtherSessionsUseCase } from './delete-other-sessions.use-case';

describe('DeleteOtherSessionsUseCase', () => {
  let useCase: DeleteOtherSessionsUseCase;
  let sessionRepository: { deleteAllSessionExceptCurrent: jest.Mock };

  beforeEach(async () => {
    sessionRepository = { deleteAllSessionExceptCurrent: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOtherSessionsUseCase,
        { provide: SessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get(DeleteOtherSessionsUseCase);
  });

  it('deletes all sessions except current and returns ok', async () => {
    sessionRepository.deleteAllSessionExceptCurrent.mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: 'user-1',
      currentDeviceId: 'device-1',
    });

    expect(result).toEqual(Notification.ok(null));
    expect(sessionRepository.deleteAllSessionExceptCurrent).toHaveBeenCalledWith(
      'user-1',
      'device-1',
    );
  });
});
