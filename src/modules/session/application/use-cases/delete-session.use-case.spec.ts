import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../infrastructure/session.repository';
import { DeleteSessionUseCase } from './delete-session.use-case';

describe('DeleteSessionUseCase', () => {
  let useCase: DeleteSessionUseCase;
  let sessionRepository: {
    findByDeviceId: jest.Mock;
    deleteOneSessionByUserAndDeviceId: jest.Mock;
  };

  beforeEach(async () => {
    sessionRepository = {
      findByDeviceId: jest.fn(),
      deleteOneSessionByUserAndDeviceId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSessionUseCase,
        { provide: SessionRepository, useValue: sessionRepository },
      ],
    }).compile();

    useCase = module.get(DeleteSessionUseCase);
  });

  it('returns NotFound when session does not exist', async () => {
    sessionRepository.findByDeviceId.mockResolvedValue(null);

    const result = await useCase.execute({ userId: 'user-1', deviceId: 'device-1' });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(sessionRepository.deleteOneSessionByUserAndDeviceId).not.toHaveBeenCalled();
  });

  it('returns Forbidden when session belongs to another user', async () => {
    sessionRepository.findByDeviceId.mockResolvedValue(
      SessionEntity.create({
        userId: 'other-user',
        deviceId: 'device-1',
        ip: '127.0.0.1',
        title: 'Chrome',
        lastActiveDate: '2024-01-01T00:00:00.000Z',
        currentRefreshTokenJti: 'jti-1',
      }),
    );

    const result = await useCase.execute({ userId: 'user-1', deviceId: 'device-1' });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.Forbidden));
    expect(sessionRepository.deleteOneSessionByUserAndDeviceId).not.toHaveBeenCalled();
  });

  it('returns NotFound when delete returns false', async () => {
    sessionRepository.findByDeviceId.mockResolvedValue(
      SessionEntity.create({
        userId: 'user-1',
        deviceId: 'device-1',
        ip: '127.0.0.1',
        title: 'Chrome',
        lastActiveDate: '2024-01-01T00:00:00.000Z',
        currentRefreshTokenJti: 'jti-1',
      }),
    );
    sessionRepository.deleteOneSessionByUserAndDeviceId.mockResolvedValue(false);

    const result = await useCase.execute({ userId: 'user-1', deviceId: 'device-1' });

    expect(result).toMatchObject({
      code: DomainExceptionCode.NotFound,
    });
  });

  it('returns ok when session is deleted', async () => {
    sessionRepository.findByDeviceId.mockResolvedValue(
      SessionEntity.create({
        userId: 'user-1',
        deviceId: 'device-1',
        ip: '127.0.0.1',
        title: 'Chrome',
        lastActiveDate: '2024-01-01T00:00:00.000Z',
        currentRefreshTokenJti: 'jti-1',
      }),
    );
    sessionRepository.deleteOneSessionByUserAndDeviceId.mockResolvedValue(true);

    const result = await useCase.execute({ userId: 'user-1', deviceId: 'device-1' });

    expect(result).toEqual(Notification.ok(null));
    expect(sessionRepository.deleteOneSessionByUserAndDeviceId).toHaveBeenCalledWith(
      'user-1',
      'device-1',
    );
  });
});
