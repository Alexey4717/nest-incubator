import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostRepository } from '../../infrastructure/post.repository.mongodb';

type UpdatePostInput = {
  id: string;
  input: UpdatePostDto;
};

@Injectable()
export class UpdatePostUseCase implements IUseCase<UpdatePostInput, boolean> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute({ id, input }: UpdatePostInput): Promise<boolean> {
    await validateOrRejectModel(input, UpdatePostDto, 'UpdatePostUseCase.execute');
    return this.postRepository.updatePost({ id, input });
  }
}
