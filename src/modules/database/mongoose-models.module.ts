import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from '@/modules/blog/models/blog.schema';
import { Comment, CommentSchema } from '@/modules/comment/models/comment.schema';
import { Post, PostSchema } from '@/modules/post/models/post.schema';
import { Session, SessionSchema } from '@/modules/session/models/session.schema';
import { User, UserSchema } from '@/modules/user/models/user.schema';

const mongooseModels = [
  { name: User.name, schema: UserSchema as ModelDefinition['schema'] },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Session.name, schema: SessionSchema },
];

/**
 * Одна регистрация Mongoose-моделей на соединение; импортируйте этот модуль
 * вместо повторного MongooseModule.forFeature(...), иначе OverwriteModelError.
 */
@Module({
  imports: [MongooseModule.forFeature(mongooseModels)],
  exports: [MongooseModule],
})
export class MongooseModelsModule {}
