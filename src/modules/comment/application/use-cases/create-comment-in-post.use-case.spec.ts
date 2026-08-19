import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { PostRepository } from '@/modules/post/infrastructure/post.repository';

import { CommentEntity } from '../../domain/entities/comment.entity';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { CreateCommentInPostUseCase } from './create-comment-in-post.use-case';

describe('CreateCommentInPostUseCase', () => {
  let useCase: CreateCommentInPostUseCase;
  let commentRepository: { createCommentInPost: jest.Mock };
  let postRepository: { findById: jest.Mock };

  const input = {
    postId: 'post-1',
    userId: 'user-1',
    userLogin: 'login',
    content: 'This is a valid comment content',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentInPostUseCase,
        {
          provide: CommentRepository,
          useValue: { createCommentInPost: jest.fn() },
        },
        {
          provide: PostRepository,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateCommentInPostUseCase);
    commentRepository = module.get(CommentRepository);
    postRepository = module.get(PostRepository);
  });

  it('creates comment in existing post and returns mapped model', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    commentRepository.createCommentInPost.mockResolvedValue(true);

    const result = await useCase.execute(input);

    expect(postRepository.findById).toHaveBeenCalledWith(input.postId);
    expect(commentRepository.createCommentInPost).toHaveBeenCalledWith(expect.any(CommentEntity));
    expect(result).toMatchObject({
      data: {
        postId: input.postId,
        content: input.content,
        commentatorInfo: {
          userId: input.userId,
          userLogin: input.userLogin,
        },
      },
    });
  });

  it('returns NotFound when post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(input);

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(commentRepository.createCommentInPost).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when create fails', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    commentRepository.createCommentInPost.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
