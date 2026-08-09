import { Test, TestingModule } from '@nestjs/testing';

import { Result } from '@/core/result/result.factory';
import { ResultStatus } from '@/core/result/result.types';

import { DeleteOtherSessionsUseCase } from '@/modules/session/application/use-cases/delete-other-sessions.use-case';

import { TerminateOtherDevicesUseCase } from './terminate-other-devices.use-case';

describe('TerminateOtherDevicesUseCase', () => {
  let useCase: TerminateOtherDevicesUseCase;
  let deleteOtherSessionsUseCase: { execute: jest.Mock };

  const input = {
    userId: 'user-1',
    deviceId: 'device-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminateOtherDevicesUseCase,
        {
          provide: DeleteOtherSessionsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(TerminateOtherDevicesUseCase);
    deleteOtherSessionsUseCase = module.get(DeleteOtherSessionsUseCase);
  });

  it('delegates to DeleteOtherSessionsUseCase with currentDeviceId mapped', async () => {
    deleteOtherSessionsUseCase.execute.mockResolvedValue(Result.ok(null));

    const result = await useCase.execute(input);

    expect(deleteOtherSessionsUseCase.execute).toHaveBeenCalledWith({
      userId: input.userId,
      currentDeviceId: input.deviceId,
    });
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });
});
