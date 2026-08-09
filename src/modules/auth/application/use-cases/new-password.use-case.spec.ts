import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Result } from '@/core/result/result.factory';

import { ChangePasswordUseCase } from '@/modules/user/application/use-cases/change-password.use-case';

import { NewPasswordUseCase } from './new-password.use-case';

describe('NewPasswordUseCase', () => {
  let useCase: NewPasswordUseCase;
  let changePasswordUseCase: { execute: jest.Mock };

  const input = {
    recoveryCode: 'recovery-code',
    newPassword: 'newPassword1',
  };

  beforeEach(async () => {
    changePasswordUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewPasswordUseCase,
        { provide: ChangePasswordUseCase, useValue: changePasswordUseCase },
      ],
    }).compile();

    useCase = module.get(NewPasswordUseCase);
  });

  it('changes password successfully', async () => {
    changePasswordUseCase.execute.mockResolvedValue(Result.ok(null));

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(changePasswordUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('throws DomainException when password change fails', async () => {
    changePasswordUseCase.execute.mockResolvedValue(
      Result.fail(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DomainException);
  });
});
