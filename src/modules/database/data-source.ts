import { join } from 'path';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/shared/core/env-files.utility';

import { BlogEntity } from '@/modules/blog/infrastructure/blog.entity';
import { CommentReactionEntity } from '@/modules/comment/infrastructure/comment-reaction.entity';
import { CommentEntity } from '@/modules/comment/infrastructure/comment.entity';
import { PostReactionEntity } from '@/modules/post/infrastructure/post-reaction.entity';
import { PostEntity } from '@/modules/post/infrastructure/post.entity';
import { SessionEntity } from '@/modules/session/infrastructure/session.entity';
import { UserEntity } from '@/modules/user/infrastructure/user.entity';

import { buildPostgresConnectionOptions } from './postgres-options.utility';

const nodeEnv = process.env.NODE_ENV || 'development';

loadEnvFiles(join(__dirname, '../../env'), nodeEnv);

export default new DataSource({
  ...buildPostgresConnectionOptions({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.POSTGRES_SSL,
  }),
  entities: [
    UserEntity,
    SessionEntity,
    BlogEntity,
    PostEntity,
    PostReactionEntity,
    CommentEntity,
    CommentReactionEntity,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
