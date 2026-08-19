import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { CommentDb, CommentEntity } from '../../domain/entities/comment.entity';
import { UpdateCommentDTO } from '../../dto/update-comment.dto';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { UpdateCommentUseCase } from './update-comment.use-case';

describe('UpdateCommentUseCase', () => {
  let useCase: UpdateCommentUseCase;
  let commentRepository: {
    findById: jest.Mock;
    save: jest.Mock;
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

  const makeDto = (content = 'Updated comment content text'): UpdateCommentDTO => {
    const dto = new UpdateCommentDTO();
    dto.content = content;
    return dto;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCommentUseCase,
        {
          provide: CommentRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(UpdateCommentUseCase);
    commentRepository = module.get(CommentRepository);
  });

  it('updates comment content when user is owner', async () => {
    const comment = CommentEntity.reconstitute(baseDb());
    const dto = makeDto();
    commentRepository.findById.mockResolvedValue(comment);
    commentRepository.save.mockResolvedValue(true);

    const result = await useCase.execute({
      id: 'comment-1',
      userId: 'user-1',
      input: dto,
    });

    expect(commentRepository.findById).toHaveBeenCalledWith('comment-1');
    expect(comment.toDb().content).toBe(dto.content);
    expect(commentRepository.save).toHaveBeenCalledWith(comment);
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when comment does not exist', async () => {
    commentRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      id: 'missing',
      userId: 'user-1',
      input: makeDto(),
    });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(commentRepository.save).not.toHaveBeenCalled();
  });

  it('returns Forbidden when user is not the owner', async () => {
    const comment = CommentEntity.reconstitute(baseDb({ userId: 'owner' }));
    commentRepository.findById.mockResolvedValue(comment);

    const result = await useCase.execute({
      id: 'comment-1',
      userId: 'other-user',
      input: makeDto(),
    });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.Forbidden));
    expect(commentRepository.save).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when save fails', async () => {
    const comment = CommentEntity.reconstitute(baseDb());
    commentRepository.findById.mockResolvedValue(comment);
    commentRepository.save.mockResolvedValue(false);

    await expect(
      useCase.execute({
        id: 'comment-1',
        userId: 'user-1',
        input: makeDto(),
      }),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });

  it('throws ValidationError for invalid content length', async () => {
    await expect(
      useCase.execute({
        id: 'comment-1',
        userId: 'user-1',
        input: makeDto('short'),
      }),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.ValidationError,
    });

    expect(commentRepository.findById).not.toHaveBeenCalled();
  });
});
