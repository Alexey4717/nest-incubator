import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { DeleteSessionUseCase } from '@/modules/session/application/use-cases/delete-session.use-case';

import { TerminateDeviceUseCase } from './terminate-device.use-case';

describe('TerminateDeviceUseCase', () => {
  let useCase: TerminateDeviceUseCase;
  let deleteSessionUseCase: { execute: jest.Mock };

  const input = {
    userId: 'user-1',
    deviceId: 'device-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminateDeviceUseCase,
        {
          provide: DeleteSessionUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(TerminateDeviceUseCase);
    deleteSessionUseCase = module.get(DeleteSessionUseCase);
  });

  it('delegates to DeleteSessionUseCase and returns its result', async () => {
    deleteSessionUseCase.execute.mockResolvedValue(Notification.ok(null));

    const result = await useCase.execute(input);

    expect(deleteSessionUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual(Notification.ok(null));
  });

  it('propagates NotFound from DeleteSessionUseCase', async () => {
    deleteSessionUseCase.execute.mockResolvedValue(Notification.fail(DomainExceptionCode.NotFound));

    const result = await useCase.execute(input);

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });

  it('propagates Forbidden from DeleteSessionUseCase', async () => {
    deleteSessionUseCase.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.Forbidden),
    );

    const result = await useCase.execute(input);

    expect(result).toEqual(Notification.fail(DomainExceptionCode.Forbidden));
  });
});
