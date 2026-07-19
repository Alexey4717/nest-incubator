import { join } from 'path';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { BlogOrmEntity } from '@/modules/blog/infrastructure/blog.orm-entity';
import { CommentReactionEntity } from '@/modules/comment/infrastructure/comment-reaction.entity';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/comment.orm-entity';
import { PostReactionEntity } from '@/modules/post/infrastructure/post-reaction.entity';
import { PostOrmEntity } from '@/modules/post/infrastructure/post.orm-entity';
import { SessionOrmEntity } from '@/modules/session/infrastructure/session.orm-entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

import { buildPostgresConnectionOptions } from './postgres-options.utility';

const nodeEnv = process.env.NODE_ENV || 'development';

loadEnvFiles(join(__dirname, '../../env'), nodeEnv);

export default new DataSource({
  ...buildPostgresConnectionOptions({
    host: process.env.POSTGRES_HOST ?? '',
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER ?? '',
    password: process.env.POSTGRES_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    ssl: process.env.POSTGRES_SSL,
  }),
  entities: [
    UserOrmEntity,
    SessionOrmEntity,
    BlogOrmEntity,
    PostOrmEntity,
    PostReactionEntity,
    CommentOrmEntity,
    CommentReactionEntity,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
