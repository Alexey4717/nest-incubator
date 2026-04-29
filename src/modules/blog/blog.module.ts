import { Module } from '@nestjs/common';
import { BlogController } from './api/blog.controller';
import { BlogService } from './application/blog.service';
import { BlogRepository } from './infrastructure/blog.repository.mongodb';
import { BlogQueryRepository } from './infrastructure/blog-query.repository.mongodb';
import { MongooseModelsModule } from '../database/mongoose-models.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModelsModule, AuthModule],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository, BlogQueryRepository],
})
export class BlogModule {}
