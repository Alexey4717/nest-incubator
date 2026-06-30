import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';

import { BlogController } from './api/blog.controller';
import { BlogService } from './application/blog.service';
import { BlogQueryRepository } from './infrastructure/blog-query.repository.mongodb';
import { BlogRepository } from './infrastructure/blog.repository.mongodb';

@Module({
  imports: [MongooseModelsModule, AuthModule],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository, BlogQueryRepository],
})
export class BlogModule {}
