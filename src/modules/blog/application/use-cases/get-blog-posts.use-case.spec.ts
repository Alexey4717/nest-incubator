import { Test, TestingModule } from '@nestjs/testing';

import { PostViewMapper } from '@/modules/post/post.view-mapper';

import { BlogQueryRepository } from '../../infrastructure/blog-query.repository';
import { GetBlogPostsUseCase } from './get-blog-posts.use-case';

describe('GetBlogPostsUseCase', () => {
  let useCase: GetBlogPostsUseCase;
  let blogQueryRepository: { getPostsInBlog: jest.Mock };
  let postViewMapper: { toPostViewModel: jest.Mock };

  beforeEach(async () => {
    blogQueryRepository = { getPostsInBlog: jest.fn() };
    postViewMapper = { toPostViewModel: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBlogPostsUseCase,
        { provide: BlogQueryRepository, useValue: blogQueryRepository },
        { provide: PostViewMapper, useValue: postViewMapper },
      ],
    }).compile();

    useCase = module.get(GetBlogPostsUseCase);
  });

  it('returns null when blog posts are not found', async () => {
    blogQueryRepository.getPostsInBlog.mockResolvedValue(null);

    await expect(
      useCase.execute({ blogId: 'b1', query: {} as never, currentUserId: 'u1' }),
    ).resolves.toBeNull();
  });

  it('maps items through PostViewMapper', async () => {
    blogQueryRepository.getPostsInBlog.mockResolvedValue({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{ id: 'p1' }],
    });
    postViewMapper.toPostViewModel.mockReturnValue({ id: 'p1', title: 'Post' });

    await expect(
      useCase.execute({ blogId: 'b1', query: {} as never, currentUserId: 'u1' }),
    ).resolves.toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{ id: 'p1', title: 'Post' }],
    });
    expect(postViewMapper.toPostViewModel).toHaveBeenCalledWith({ id: 'p1' }, 'u1');
  });
});
