import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentRepository } from '../../infrastructure/comment.repository';
import { UpdateCommentLikeStatusUseCase } from './update-comment-like-status.use-case';

describe('UpdateCommentLikeStatusUseCase', () => {
  let useCase: UpdateCommentLikeStatusUseCase;
  let commentRepository: { updateCommentLikeStatusByCommentId: jest.Mock };

  const input = {
    commentId: 'comment-1',
    userId: 'user-1',
    likeStatus: LikeStatus.Like,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCommentLikeStatusUseCase,
        {
          provide: CommentRepository,
          useValue: { updateCommentLikeStatusByCommentId: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdateCommentLikeStatusUseCase);
    commentRepository = module.get(CommentRepository);
  });

  it('updates like status and returns success', async () => {
    commentRepository.updateCommentLikeStatusByCommentId.mockResolvedValue(true);

    const result = await useCase.execute(input);

    expect(commentRepository.updateCommentLikeStatusByCommentId).toHaveBeenCalledWith(input);
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when comment like status was not updated', async () => {
    commentRepository.updateCommentLikeStatusByCommentId.mockResolvedValue(false);

    const result = await useCase.execute(input);

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
