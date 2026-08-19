import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

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

  it('deletes post and returns Notification.ok(null)', async () => {
    postRepository.deletePostById.mockResolvedValue(true);

    const result = await useCase.execute('post-1');

    expect(postRepository.deletePostById).toHaveBeenCalledWith('post-1');
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when delete returns false', async () => {
    postRepository.deletePostById.mockResolvedValue(false);

    const result = await useCase.execute('missing');

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
