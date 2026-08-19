import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { FindUserByIdQuery } from '@/modules/user/application/queries/find-user-by-id.query';

import { GetMeUseCase } from './get-me.use-case';

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let queryBus: { execute: jest.Mock };

  beforeEach(async () => {
    queryBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetMeUseCase, { provide: QueryBus, useValue: queryBus }],
    }).compile();

    useCase = module.get(GetMeUseCase);
  });

  it('returns null when user is not found', async () => {
    queryBus.execute.mockResolvedValue(null);
    await expect(useCase.execute('missing')).resolves.toBeNull();
    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(FindUserByIdQuery));
  });

  it('maps user entity to MeViewModel', async () => {
    queryBus.execute.mockResolvedValue({
      id: 'u1',
      login: 'alice',
      email: 'a@b.c',
    });

    await expect(useCase.execute('u1')).resolves.toEqual({
      userId: 'u1',
      login: 'alice',
      email: 'a@b.c',
    });
    expect(queryBus.execute.mock.calls[0][0].id).toBe('u1');
  });
});
