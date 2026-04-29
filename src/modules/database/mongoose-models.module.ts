import { Module } from '@nestjs/common';
import { MongooseModule, ModelDefinition } from '@nestjs/mongoose';

import { User, UserSchema } from '../user/models/user.schema';
import { Blog, BlogSchema } from '../blog/models/blog.schema';
import { Post, PostSchema } from '../post/models/post.schema';
import { Comment, CommentSchema } from '../comment/models/comment.schema';
import { Session, SessionSchema } from '../session/models/session.schema';

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
