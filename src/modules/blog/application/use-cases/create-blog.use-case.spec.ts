import { Test, TestingModule } from '@nestjs/testing';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { BlogEntity } from '../../domain/entities/blog.entity';
import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { CreateBlogUseCase } from './create-blog.use-case';

describe('CreateBlogUseCase', () => {
  let useCase: CreateBlogUseCase;
  let blogRepository: { createBlog: jest.Mock };

  const dto = (overrides: Partial<CreateBlogDTO> = {}): CreateBlogDTO =>
    Object.assign(new CreateBlogDTO(), {
      name: 'My Blog',
      websiteUrl: 'https://example.com',
      description: 'A blog description',
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBlogUseCase,
        {
          provide: BlogRepository,
          useValue: { createBlog: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateBlogUseCase);
    blogRepository = module.get(BlogRepository);
  });

  it('creates blog and returns Notification.ok with mapped model', async () => {
    const saved = BlogEntity.create({
      name: 'My Blog',
      websiteUrl: 'https://example.com',
      description: 'A blog description',
    });
    blogRepository.createBlog.mockResolvedValue(saved);

    const result = await useCase.execute(dto());

    expect(blogRepository.createBlog).toHaveBeenCalledWith(expect.any(BlogEntity));
    expect(result).toMatchObject({
      data: {
        id: saved.id,
        name: 'My Blog',
        websiteUrl: 'https://example.com',
        description: 'A blog description',
        isMembership: false,
      },
    });
  });

  it('throws InternalServerError when repository create returns null', async () => {
    blogRepository.createBlog.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow(DomainException);
    await expect(useCase.execute(dto())).rejects.toMatchObject({
      code: DomainExceptionCode.InternalServerError,
    });
  });
});
