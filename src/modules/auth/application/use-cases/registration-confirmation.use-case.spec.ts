import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { ConfirmEmailCommand } from '@/modules/user/application/commands/confirm-email.command';

import { RegistrationConfirmationUseCase } from './registration-confirmation.use-case';

describe('RegistrationConfirmationUseCase', () => {
  let useCase: RegistrationConfirmationUseCase;
  let commandBus: { execute: jest.Mock };

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationConfirmationUseCase, { provide: CommandBus, useValue: commandBus }],
    }).compile();

    useCase = module.get(RegistrationConfirmationUseCase);
  });

  it('confirms email successfully', async () => {
    commandBus.execute.mockResolvedValue(Notification.ok(null));

    await expect(useCase.execute('code-1')).resolves.toBeUndefined();
    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ConfirmEmailCommand));
    expect(commandBus.execute.mock.calls[0][0].code).toBe('code-1');
  });

  it('throws DomainException when confirmation fails', async () => {
    commandBus.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]),
    );

    await expect(useCase.execute('bad-code')).rejects.toBeInstanceOf(DomainException);
  });
});
