import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { ChangePasswordCommand } from '@/modules/user/application/commands/change-password.command';

import { NewPasswordUseCase } from './new-password.use-case';

describe('NewPasswordUseCase', () => {
  let useCase: NewPasswordUseCase;
  let commandBus: { execute: jest.Mock };

  const input = {
    recoveryCode: 'recovery-code',
    newPassword: 'newPassword1',
  };

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NewPasswordUseCase, { provide: CommandBus, useValue: commandBus }],
    }).compile();

    useCase = module.get(NewPasswordUseCase);
  });

  it('changes password successfully', async () => {
    commandBus.execute.mockResolvedValue(Notification.ok(null));

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ChangePasswordCommand));
    expect(commandBus.execute.mock.calls[0][0].input).toEqual(input);
  });

  it('throws DomainException when password change fails', async () => {
    commandBus.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DomainException);
  });
});
