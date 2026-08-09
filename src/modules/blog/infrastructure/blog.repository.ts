import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from '@/modules/post/domain/entities/post.entity';
import { PostRepository } from '@/modules/post/infrastructure/post.repository';

import { BlogEntity } from '../domain/entities/blog.entity';
import { BlogOrmEntity } from './blog.orm-entity';
import { BlogPersistenceMapper } from './blog.persistence-mapper';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(BlogOrmEntity)
    private readonly blogsRepository: Repository<BlogOrmEntity>,
    private readonly postRepository: PostRepository,
  ) {}

  async createBlog(newBlog: BlogEntity): Promise<BlogEntity | null> {
    try {
      const entity = BlogPersistenceMapper.toPersistence(newBlog);
      const saved = await this.blogsRepository.save(entity);
      return BlogPersistenceMapper.toDomain(saved);
    } catch (error: unknown) {
      console.log(`blogsRepository.createBlog error is occurred: ${error}`);
      return null;
    }
  }

  async findById(id: string): Promise<BlogEntity | null> {
    const entity = await this.blogsRepository.findOne({ where: { publicId: id } });
    return entity ? BlogPersistenceMapper.toDomain(entity) : null;
  }

  async save(blog: BlogEntity): Promise<boolean> {
    const data = blog.toDb();
    const result = await this.blogsRepository.update(
      { publicId: data.id },
      {
        name: data.name,
        websiteUrl: data.websiteUrl,
        description: data.description,
        isMembership: data.isMembership,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async createPostInBlog(newPost: PostEntity): Promise<boolean> {
    const result = await this.postRepository.createPost(newPost);
    return result !== null;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.blogsRepository.delete({ publicId: id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`blogsRepository.deleteBlogById error is occurred: ${error}`);
      return false;
    }
  }
}
