import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostRepository } from '@/modules/post/infrastructure/post.repository';
import { PostModel } from '@/modules/post/models/post.model';

import { BlogModel } from '../models/blog.model';
import { UpdateBlogInputModel } from '../models/UpdateBlogInputModel';
import { BlogEntity } from './blog.entity';
import { toDomain, toOrm } from './blog.mapper';

interface UpdateBlogArgs {
  id: string;
  input: UpdateBlogInputModel;
}

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogsRepository: Repository<BlogEntity>,
    private readonly postRepository: PostRepository,
  ) {}

  async createBlog(newBlog: BlogModel): Promise<BlogModel | null> {
    try {
      const entity = toOrm(newBlog);
      const saved = await this.blogsRepository.save(entity);
      return toDomain(saved);
    } catch (error: unknown) {
      console.log(`blogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async createPostInBlog(newPost: PostModel): Promise<boolean> {
    const result = await this.postRepository.createPost(newPost);
    return result !== null;
  }

  async updateBlog({ id, input }: UpdateBlogArgs): Promise<boolean> {
    try {
      const existingBlog = await this.blogsRepository.findOne({ where: { id } });
      if (!existingBlog) return false;

      const blogWithSameName = await this.blogsRepository
        .createQueryBuilder('blog')
        .where('blog.name = :name', { name: input.name })
        .andWhere('blog.id != :id', { id })
        .getOne();

      if (blogWithSameName) {
        throw new BadRequestException({
          message: [{ message: 'This name already exists', field: 'name' }],
          error: 'Bad Request',
        });
      }

      const result = await this.blogsRepository.update({ id }, input);
      return (result.affected ?? 0) === 1;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(`blogsRepository.updateBlog error is occurred: ${error}`);
      return false;
    }
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.blogsRepository.delete({ id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`blogsRepository.deleteBlogById error is occurred: ${error}`);
      return false;
    }
  }
}
