import { Test, TestingModule } from '@nestjs/testing';

import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id.use-case';

import { GetMeUseCase } from './get-me.use-case';

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let findUserByIdUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    findUserByIdUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetMeUseCase, { provide: FindUserByIdUseCase, useValue: findUserByIdUseCase }],
    }).compile();

    useCase = module.get(GetMeUseCase);
  });

  it('returns null when user is not found', async () => {
    findUserByIdUseCase.execute.mockResolvedValue(null);
    await expect(useCase.execute('missing')).resolves.toBeNull();
  });

  it('maps user entity to MeViewModel', async () => {
    findUserByIdUseCase.execute.mockResolvedValue({
      id: 'u1',
      login: 'alice',
      email: 'a@b.c',
    });

    await expect(useCase.execute('u1')).resolves.toEqual({
      userId: 'u1',
      login: 'alice',
      email: 'a@b.c',
    });
  });
});
