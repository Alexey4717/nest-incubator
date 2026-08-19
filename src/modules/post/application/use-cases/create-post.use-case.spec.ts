import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { BlogQueryRepository } from '@/modules/blog/infrastructure/blog-query.repository';

import { PostEntity } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostRepository } from '../../infrastructure/post.repository';
import { PostViewMapper } from '../../post.view-mapper';
import { CreatePostUseCase } from './create-post.use-case';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let postRepository: { createPost: jest.Mock };
  let blogQueryRepository: { findBlogById: jest.Mock };
  let postViewMapper: { toPostViewModel: jest.Mock };

  const blogModel = {
    id: 'blog-1',
    name: 'Blog Name',
    websiteUrl: 'https://example.com',
    description: 'desc',
    isMembership: false,
    createdAt: '2020-01-01T00:00:00.000Z',
  };

  const input = {
    blogId: 'blog-1',
    title: 'Post title',
    shortDescription: 'Short description',
    content: 'Post content',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
        {
          provide: PostRepository,
          useValue: { createPost: jest.fn() },
        },
        {
          provide: BlogQueryRepository,
          useValue: { findBlogById: jest.fn() },
        },
        {
          provide: PostViewMapper,
          useValue: { toPostViewModel: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreatePostUseCase);
    postRepository = module.get(PostRepository);
    blogQueryRepository = module.get(BlogQueryRepository);
    postViewMapper = module.get(PostViewMapper);
  });

  describe('execute', () => {
    it('creates post for existing blog and returns Notification.ok', async () => {
      blogQueryRepository.findBlogById.mockResolvedValue(blogModel);
      const saved = PostEntity.create(input, blogModel.name);
      postRepository.createPost.mockResolvedValue(saved);

      const result = await useCase.execute(input);

      expect(postRepository.createPost).toHaveBeenCalledWith(expect.any(PostEntity));
      expect(result).toMatchObject({
        data: {
          id: saved.id,
          title: 'Post title',
          blogId: 'blog-1',
          blogName: 'Blog Name',
          reactions: [],
        },
      });
    });

    it('returns NotFound when blog does not exist', async () => {
      blogQueryRepository.findBlogById.mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
      expect(postRepository.createPost).not.toHaveBeenCalled();
    });

    it('throws InternalServerError when createPost returns null', async () => {
      blogQueryRepository.findBlogById.mockResolvedValue(blogModel);
      postRepository.createPost.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(DomainException);
      await expect(useCase.execute(input)).rejects.toMatchObject({
        code: DomainExceptionCode.InternalServerError,
      });
    });
  });

  describe('executeFromDto', () => {
    const dto = (): CreatePostDto => Object.assign(new CreatePostDto(), input);

    it('maps created post to view model on success', async () => {
      blogQueryRepository.findBlogById.mockResolvedValue(blogModel);
      const saved = PostEntity.create(input, blogModel.name);
      postRepository.createPost.mockResolvedValue(saved);
      const view = {
        id: saved.id,
        title: 'Post title',
        shortDescription: 'Short description',
        content: 'Post content',
        blogId: 'blog-1',
        blogName: 'Blog Name',
        createdAt: saved.toDb().createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
      postViewMapper.toPostViewModel.mockReturnValue(view);

      const result = await useCase.executeFromDto(dto());

      expect(postViewMapper.toPostViewModel).toHaveBeenCalled();
      expect(result).toEqual(Notification.ok(view));
    });

    it('propagates failure without mapping view', async () => {
      blogQueryRepository.findBlogById.mockResolvedValue(null);

      const result = await useCase.executeFromDto(dto());

      expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
      expect(postViewMapper.toPostViewModel).not.toHaveBeenCalled();
    });
  });
});
