import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './models/Blog.schema';
import { BlogController } from './api/blog.controller';
import { BlogService } from './application/blog.service';
import { BlogRepository } from './infrastructure/blog.repository';
import { BlogQueryRepository } from './infrastructure/blog-query.repository';

const schemas = [{ name: Blog.name, schema: BlogSchema }];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository, BlogQueryRepository],
})
export class BlogModule {}
