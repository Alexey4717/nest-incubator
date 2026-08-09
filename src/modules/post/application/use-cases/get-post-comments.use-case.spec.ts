import { Test, TestingModule } from '@nestjs/testing';

import { CommentViewMapper } from '@/modules/comment/comment.view-mapper';
import { CommentQueryRepository } from '@/modules/comment/infrastructure/comment-query.repository';

import { GetPostCommentsUseCase } from './get-post-comments.use-case';

describe('GetPostCommentsUseCase', () => {
  let useCase: GetPostCommentsUseCase;
  let commentQueryRepository: { getPostComments: jest.Mock };
  let commentViewMapper: { toCommentViewModel: jest.Mock };

  beforeEach(async () => {
    commentQueryRepository = { getPostComments: jest.fn() };
    commentViewMapper = { toCommentViewModel: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostCommentsUseCase,
        { provide: CommentQueryRepository, useValue: commentQueryRepository },
        { provide: CommentViewMapper, useValue: commentViewMapper },
      ],
    }).compile();

    useCase = module.get(GetPostCommentsUseCase);
  });

  it('returns null when post comments are not found', async () => {
    commentQueryRepository.getPostComments.mockResolvedValue(null);

    await expect(
      useCase.execute({ postId: 'p1', query: {} as never, currentUserId: null }),
    ).resolves.toBeNull();
  });

  it('maps items and treats null currentUserId as undefined', async () => {
    commentQueryRepository.getPostComments.mockResolvedValue({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{ id: 'c1' }],
    });
    commentViewMapper.toCommentViewModel.mockReturnValue({ id: 'c1', content: 'hi' });

    await expect(
      useCase.execute({ postId: 'p1', query: {} as never, currentUserId: null }),
    ).resolves.toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{ id: 'c1', content: 'hi' }],
    });
    expect(commentViewMapper.toCommentViewModel).toHaveBeenCalledWith({ id: 'c1' }, undefined);
  });
});
