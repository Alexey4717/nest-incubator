import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { BlogQueryRepository } from '@/modules/blog/infrastructure/blog-query.repository';

import { PostEntity } from '../../domain/entities/post.entity';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostRepository } from '../../infrastructure/post.repository';
import { UpdatePostUseCase } from './update-post.use-case';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let postRepository: { findById: jest.Mock; save: jest.Mock };
  let blogQueryRepository: { findBlogById: jest.Mock };

  const inputDto = (overrides: Partial<UpdatePostDto> = {}): UpdatePostDto =>
    Object.assign(new UpdatePostDto(), {
      title: 'New title',
      shortDescription: 'New short',
      content: 'New content',
      blogId: 'blog-2',
      ...overrides,
    });

  const existingPost = () =>
    PostEntity.reconstitute({
      id: 'post-1',
      title: 'Old',
      shortDescription: 'Old short',
      content: 'Old content',
      blogId: 'blog-1',
      blogName: 'Old Blog',
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      likesCount: 0,
      dislikesCount: 0,
    });

  const blog = {
    id: 'blog-2',
    name: 'New Blog',
    websiteUrl: 'https://example.com',
    description: 'desc',
    isMembership: false,
    createdAt: '2020-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePostUseCase,
        {
          provide: PostRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: BlogQueryRepository,
          useValue: { findBlogById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdatePostUseCase);
    postRepository = module.get(PostRepository);
    blogQueryRepository = module.get(BlogQueryRepository);
  });

  it('updates post with blog name and returns Notification.ok(null)', async () => {
    const post = existingPost();
    postRepository.findById.mockResolvedValue(post);
    blogQueryRepository.findBlogById.mockResolvedValue(blog);
    postRepository.save.mockResolvedValue(post);

    const result = await useCase.execute({ id: 'post-1', input: inputDto() });

    expect(post.toDb()).toMatchObject({
      title: 'New title',
      shortDescription: 'New short',
      content: 'New content',
      blogId: 'blog-2',
      blogName: 'New Blog',
    });
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'missing', input: inputDto() });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(blogQueryRepository.findBlogById).not.toHaveBeenCalled();
  });

  it('returns NotFound when target blog does not exist', async () => {
    postRepository.findById.mockResolvedValue(existingPost());
    blogQueryRepository.findBlogById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'post-1', input: inputDto() });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(postRepository.save).not.toHaveBeenCalled();
  });

  it('returns NotFound when save returns null', async () => {
    postRepository.findById.mockResolvedValue(existingPost());
    blogQueryRepository.findBlogById.mockResolvedValue(blog);
    postRepository.save.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'post-1', input: inputDto() });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
