import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogEntity } from '@/modules/blog/infrastructure/blog.entity';
import { CommentReactionEntity } from '@/modules/comment/infrastructure/comment-reaction.entity';
import { CommentEntity } from '@/modules/comment/infrastructure/comment.entity';
import { PostReactionEntity } from '@/modules/post/infrastructure/post-reaction.entity';
import { PostEntity } from '@/modules/post/infrastructure/post.entity';
import { SessionEntity } from '@/modules/session/infrastructure/session.entity';
import { UserEntity } from '@/modules/user/infrastructure/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      BlogEntity,
      PostEntity,
      PostReactionEntity,
      CommentEntity,
      CommentReactionEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmEntitiesModule {}
