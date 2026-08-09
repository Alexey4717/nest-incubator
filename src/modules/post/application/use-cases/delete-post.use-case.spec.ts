import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { ResultStatus } from '@/core/result/result.types';

import { PostRepository } from '../../infrastructure/post.repository';
import { DeletePostUseCase } from './delete-post.use-case';

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
  let postRepository: { deletePostById: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePostUseCase,
        {
          provide: PostRepository,
          useValue: { deletePostById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(DeletePostUseCase);
    postRepository = module.get(PostRepository);
  });

  it('deletes post and returns Result.ok(null)', async () => {
    postRepository.deletePostById.mockResolvedValue(true);

    const result = await useCase.execute('post-1');

    expect(postRepository.deletePostById).toHaveBeenCalledWith('post-1');
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns NotFound when delete returns false', async () => {
    postRepository.deletePostById.mockResolvedValue(false);

    const result = await useCase.execute('missing');

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.NotFound,
      extensions: [],
    });
  });
});
