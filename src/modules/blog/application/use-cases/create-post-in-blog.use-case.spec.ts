import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { Notification } from '@/core/notification/notification';

import { CreatePostUseCase } from '@/modules/post/application/use-cases/create-post.use-case';

import { CreatePostInBlogDTO } from '../../dto/create-post-in-blog.dto';
import { CreatePostInBlogUseCase } from './create-post-in-blog.use-case';

describe('CreatePostInBlogUseCase', () => {
  let useCase: CreatePostInBlogUseCase;
  let createPostUseCase: { execute: jest.Mock };

  const dto = (overrides: Partial<CreatePostInBlogDTO> = {}): CreatePostInBlogDTO =>
    Object.assign(new CreatePostInBlogDTO(), {
      title: 'Post title',
      shortDescription: 'Short description',
      content: 'Post content',
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostInBlogUseCase,
        {
          provide: CreatePostUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreatePostInBlogUseCase);
    createPostUseCase = module.get(CreatePostUseCase);
  });

  it('delegates to CreatePostUseCase with blogId and post fields', async () => {
    const postModel = {
      id: 'post-1',
      title: 'Post title',
      shortDescription: 'Short description',
      content: 'Post content',
      blogId: 'blog-1',
      blogName: 'Blog',
      createdAt: '2020-01-01T00:00:00.000Z',
      reactions: [],
    };
    createPostUseCase.execute.mockResolvedValue(Notification.ok(postModel));

    const result = await useCase.execute({ blogId: 'blog-1', input: dto() });

    expect(createPostUseCase.execute).toHaveBeenCalledWith({
      blogId: 'blog-1',
      title: 'Post title',
      shortDescription: 'Short description',
      content: 'Post content',
    });
    expect(result).toEqual(Notification.ok(postModel));
  });

  it('propagates failure from CreatePostUseCase', async () => {
    createPostUseCase.execute.mockResolvedValue(Notification.fail(DomainExceptionCode.NotFound));

    const result = await useCase.execute({ blogId: 'missing', input: dto() });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
  });
});
