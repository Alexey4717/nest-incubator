import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

import { BlogEntity } from '@/modules/blog/infrastructure/blog.entity';
import { CommentReactionEntity } from '@/modules/comment/infrastructure/comment-reaction.entity';
import { CommentEntity } from '@/modules/comment/infrastructure/comment.entity';
import { PostReactionEntity } from '@/modules/post/infrastructure/post-reaction.entity';
import { PostEntity } from '@/modules/post/infrastructure/post.entity';
import { SessionEntity } from '@/modules/session/infrastructure/session.entity';
import { UserEntity } from '@/modules/user/infrastructure/user.entity';

import { DatabaseConfig } from './database.config';
import { buildPostgresConnectionOptions } from './postgres-options.utility';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const poolMax = process.env.NODE_ENV === 'production' ? 1 : 10;

    return {
      ...buildPostgresConnectionOptions({
        host: this.databaseConfig.POSTGRES_HOST,
        port: this.databaseConfig.POSTGRES_PORT,
        username: this.databaseConfig.POSTGRES_USER,
        password: this.databaseConfig.POSTGRES_PASSWORD,
        database: this.databaseConfig.DB_NAME,
        ssl: this.databaseConfig.POSTGRES_SSL,
        poolMax,
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
      migrationsRun: false,
    };
  }
}
