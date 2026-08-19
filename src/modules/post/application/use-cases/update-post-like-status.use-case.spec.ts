import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostRepository } from '../../infrastructure/post.repository';
import { UpdatePostLikeStatusUseCase } from './update-post-like-status.use-case';

describe('UpdatePostLikeStatusUseCase', () => {
  let useCase: UpdatePostLikeStatusUseCase;
  let postRepository: { updatePostLikeStatus: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePostLikeStatusUseCase,
        {
          provide: PostRepository,
          useValue: { updatePostLikeStatus: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdatePostLikeStatusUseCase);
    postRepository = module.get(PostRepository);
  });

  it('updates like status and returns Notification.ok(null)', async () => {
    postRepository.updatePostLikeStatus.mockResolvedValue(true);

    const result = await useCase.execute({
      postId: 'post-1',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });

    expect(postRepository.updatePostLikeStatus).toHaveBeenCalledWith({
      postId: 'post-1',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when repository update returns false', async () => {
    postRepository.updatePostLikeStatus.mockResolvedValue(false);

    const result = await useCase.execute({
      postId: 'missing',
      userId: 'user-1',
      likeStatus: LikeStatus.None,
    });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
