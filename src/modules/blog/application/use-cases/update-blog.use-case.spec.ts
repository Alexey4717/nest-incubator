import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { Notification } from '@/core/notification/notification';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { UpdateBlogUseCase } from './update-blog.use-case';

describe('UpdateBlogUseCase', () => {
  let useCase: UpdateBlogUseCase;
  let blogRepository: { findById: jest.Mock; save: jest.Mock };
  let blogQueryRepository: { findBlogByName: jest.Mock };

  const inputDto = (overrides: Partial<UpdateBlogDto> = {}): UpdateBlogDto =>
    Object.assign(new UpdateBlogDto(), {
      name: 'Updated',
      websiteUrl: 'https://updated.com',
      description: 'Updated description',
      ...overrides,
    });

  const existingBlog = () =>
    BlogEntity.reconstitute({
      id: 'blog-1',
      name: 'Old',
      websiteUrl: 'https://old.com',
      description: 'Old description',
      isMembership: false,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBlogUseCase,
        {
          provide: BlogRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: BlogQueryRepository,
          useValue: { findBlogByName: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdateBlogUseCase);
    blogRepository = module.get(BlogRepository);
    blogQueryRepository = module.get(BlogQueryRepository);
  });

  it('updates blog and returns Notification.ok(null)', async () => {
    const blog = existingBlog();
    blogRepository.findById.mockResolvedValue(blog);
    blogQueryRepository.findBlogByName.mockResolvedValue(null);
    blogRepository.save.mockResolvedValue(blog);

    const result = await useCase.execute({ id: 'blog-1', input: inputDto() });

    expect(blog.toDb()).toMatchObject({
      name: 'Updated',
      websiteUrl: 'https://updated.com',
      description: 'Updated description',
    });
    expect(blogRepository.save).toHaveBeenCalledWith(blog);
    expect(result).toEqual(Notification.ok(null));
  });

  it('returns NotFound when blog does not exist', async () => {
    blogRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'missing', input: inputDto() });

    expect(result).toEqual(Notification.fail(DomainExceptionCode.NotFound));
    expect(blogRepository.save).not.toHaveBeenCalled();
  });

  it('returns BadRequest when name belongs to another blog', async () => {
    blogRepository.findById.mockResolvedValue(existingBlog());
    blogQueryRepository.findBlogByName.mockResolvedValue({
      id: 'other-blog',
      name: 'Updated',
      websiteUrl: 'https://other.com',
      description: 'x',
      isMembership: false,
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    const result = await useCase.execute({ id: 'blog-1', input: inputDto() });

    expect(result).toMatchObject({
      code: DomainExceptionCode.BadRequest,
      messages: [{ field: 'name' }],
    });
    expect(blogRepository.save).not.toHaveBeenCalled();
  });

  it('allows update when conflicting name is the same blog', async () => {
    const blog = existingBlog();
    blogRepository.findById.mockResolvedValue(blog);
    blogQueryRepository.findBlogByName.mockResolvedValue({
      id: 'blog-1',
      name: 'Updated',
      websiteUrl: 'https://old.com',
      description: 'Old description',
      isMembership: false,
      createdAt: '2020-01-01T00:00:00.000Z',
    });
    blogRepository.save.mockResolvedValue(blog);

    const result = await useCase.execute({ id: 'blog-1', input: inputDto() });

    expect(result).toEqual(Notification.ok(null));
  });

  it('throws InternalServerError when save returns null', async () => {
    const blog = existingBlog();
    blogRepository.findById.mockResolvedValue(blog);
    blogQueryRepository.findBlogByName.mockResolvedValue(null);
    blogRepository.save.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'blog-1', input: inputDto() })).rejects.toThrow(
      DomainException,
    );
    await expect(useCase.execute({ id: 'blog-1', input: inputDto() })).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
