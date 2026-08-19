import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { CommentDb, CommentEntity } from '../../domain/entities/comment.entity';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { DeleteCommentUseCase } from './delete-comment.use-case';

describe('DeleteCommentUseCase', () => {
  let useCase: DeleteCommentUseCase;
  let commentRepository: {
    findById: jest.Mock;
    deleteCommentById: jest.Mock;
  };

  const baseDb = (overrides: Partial<CommentDb> = {}): CommentDb => ({
    id: 'comment-1',
    postId: 'post-1',
    content: 'Original comment content text',
    userId: 'user-1',
    userLogin: 'login',
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    likesCount: 0,
    dislikesCount: 0,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommentUseCase,
        {
          provide: CommentRepository,
          useValue: {
            findById: jest.fn(),
            deleteCommentById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(DeleteCommentUseCase);
    commentRepository = module.get(CommentRepository);
  });

  it('deletes comment when user is owner', async () => {
    const comment = CommentEntity.reconstitute(baseDb());
    commentRepository.findById.mockResolvedValue(comment);
    commentRepository.deleteCommentById.mockResolvedValue(true);

    const result = await useCase.execute({
      commentId: 'comment-1',
      userId: 'user-1',
    });

    expect(commentRepository.findById).toHaveBeenCalledWith('comment-1');
    expect(commentRepository.deleteCommentById).toHaveBeenCalledWith('comment-1');
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when comment does not exist', async () => {
    commentRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      commentId: 'missing',
      userId: 'user-1',
    });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(commentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('returns Forbidden when user is not the owner', async () => {
    const comment = CommentEntity.reconstitute(baseDb({ userId: 'owner' }));
    commentRepository.findById.mockResolvedValue(comment);

    const result = await useCase.execute({
      commentId: 'comment-1',
      userId: 'other-user',
    });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.Forbidden));
    expect(commentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when delete fails', async () => {
    const comment = CommentEntity.reconstitute(baseDb());
    commentRepository.findById.mockResolvedValue(comment);
    commentRepository.deleteCommentById.mockResolvedValue(false);

    await expect(
      useCase.execute({
        commentId: 'comment-1',
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
