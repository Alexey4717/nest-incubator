import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { UserRepository } from '../../infrastructure/user.repository';
import { DeleteUserUseCase } from './delete-user.use-case';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: { deleteUserById: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: UserRepository, useValue: { deleteUserById: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(DeleteUserUseCase);
    userRepository = module.get(UserRepository);
  });

  it('deletes user and returns success', async () => {
    userRepository.deleteUserById.mockResolvedValue(true);

    const result = await useCase.execute('user-1');

    expect(userRepository.deleteUserById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when user was not deleted', async () => {
    userRepository.deleteUserById.mockResolvedValue(false);

    const result = await useCase.execute('missing');

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
