import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { ConfirmEmailUseCase } from '@/modules/user/application/use-cases/confirm-email.use-case';

import { RegistrationConfirmationUseCase } from './registration-confirmation.use-case';

describe('RegistrationConfirmationUseCase', () => {
  let useCase: RegistrationConfirmationUseCase;
  let confirmEmailUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    confirmEmailUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationConfirmationUseCase,
        { provide: ConfirmEmailUseCase, useValue: confirmEmailUseCase },
      ],
    }).compile();

    useCase = module.get(RegistrationConfirmationUseCase);
  });

  it('confirms email successfully', async () => {
    confirmEmailUseCase.execute.mockResolvedValue(Notification.ok(null));

    await expect(useCase.execute('code-1')).resolves.toBeUndefined();
    expect(confirmEmailUseCase.execute).toHaveBeenCalledWith('code-1');
  });

  it('throws DomainException when confirmation fails', async () => {
    confirmEmailUseCase.execute.mockResolvedValue(
      Notification.fail(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]),
    );

    await expect(useCase.execute('bad-code')).rejects.toBeInstanceOf(DomainException);
  });
});
