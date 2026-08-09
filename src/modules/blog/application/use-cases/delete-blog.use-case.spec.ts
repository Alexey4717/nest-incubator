import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { ResultStatus } from '@/core/result/result.types';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { DeleteBlogUseCase } from './delete-blog.use-case';

describe('DeleteBlogUseCase', () => {
  let useCase: DeleteBlogUseCase;
  let blogRepository: { findById: jest.Mock; deleteBlogById: jest.Mock };

  const existingBlog = () =>
    BlogEntity.reconstitute({
      id: 'blog-1',
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
      isMembership: false,
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBlogUseCase,
        {
          provide: BlogRepository,
          useValue: { findById: jest.fn(), deleteBlogById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(DeleteBlogUseCase);
    blogRepository = module.get(BlogRepository);
  });

  it('deletes blog and returns Result.ok(null)', async () => {
    blogRepository.findById.mockResolvedValue(existingBlog());
    blogRepository.deleteBlogById.mockResolvedValue(true);

    const result = await useCase.execute('blog-1');

    expect(blogRepository.deleteBlogById).toHaveBeenCalledWith('blog-1');
    expect(result).toEqual({ status: ResultStatus.Success, data: null });
  });

  it('returns NotFound when blog does not exist', async () => {
    blogRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result).toEqual({
      status: ResultStatus.Failure,
      code: DomainExceptionCode.NotFound,
      extensions: [],
    });
    expect(blogRepository.deleteBlogById).not.toHaveBeenCalled();
  });

  it('throws InternalServerError when delete returns false', async () => {
    blogRepository.findById.mockResolvedValue(existingBlog());
    blogRepository.deleteBlogById.mockResolvedValue(false);

    await expect(useCase.execute('blog-1')).rejects.toThrow(DomainException);
    await expect(useCase.execute('blog-1')).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
