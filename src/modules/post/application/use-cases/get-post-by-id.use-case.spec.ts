import { Test, TestingModule } from '@nestjs/testing';

import { PostQueryRepository } from '../../infrastructure/post-query.repository';
import { PostViewMapper } from '../../post.view-mapper';
import { GetPostByIdUseCase } from './get-post-by-id.use-case';

describe('GetPostByIdUseCase', () => {
  let useCase: GetPostByIdUseCase;
  let postQueryRepository: { findPostById: jest.Mock };
  let postViewMapper: { toPostViewModel: jest.Mock };

  beforeEach(async () => {
    postQueryRepository = { findPostById: jest.fn() };
    postViewMapper = { toPostViewModel: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostByIdUseCase,
        { provide: PostQueryRepository, useValue: postQueryRepository },
        { provide: PostViewMapper, useValue: postViewMapper },
      ],
    }).compile();

    useCase = module.get(GetPostByIdUseCase);
  });

  it('returns null when post does not exist', async () => {
    postQueryRepository.findPostById.mockResolvedValue(null);
    await expect(useCase.execute({ id: 'missing' })).resolves.toBeNull();
    expect(postViewMapper.toPostViewModel).not.toHaveBeenCalled();
  });

  it('returns mapped post view', async () => {
    const post = { id: 'p1' };
    postQueryRepository.findPostById.mockResolvedValue(post);
    postViewMapper.toPostViewModel.mockReturnValue({ id: 'p1', title: 'Hello' });

    await expect(useCase.execute({ id: 'p1', currentUserId: 'u1' })).resolves.toEqual({
      id: 'p1',
      title: 'Hello',
    });
    expect(postViewMapper.toPostViewModel).toHaveBeenCalledWith(post, 'u1');
  });
});
