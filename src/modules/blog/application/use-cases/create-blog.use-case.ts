import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { IUseCase } from '@/shared/types/use-case';
import { validateOrRejectModel } from '@/shared/utils/helpers';

import { CreateBlogDTO } from '../../dto/create-blog.dto';
import { BlogRepository } from '../../infrastructure/blog.repository.mongodb';
import { GetBlogOutputModelFromMongoDB } from '../../models/GetBlogOutputModel';

@Injectable()
export class CreateBlogUseCase implements IUseCase<CreateBlogDTO, GetBlogOutputModelFromMongoDB> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(input: CreateBlogDTO): Promise<GetBlogOutputModelFromMongoDB> {
    await validateOrRejectModel(input, CreateBlogDTO, 'CreateBlogUseCase.execute');
    const { name, websiteUrl, description } = input || {};

    const newBlog = {
      id: randomUUID(),
      name,
      websiteUrl,
      description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    return (await this.blogRepository.createBlog(newBlog)) as GetBlogOutputModelFromMongoDB;
  }
}
