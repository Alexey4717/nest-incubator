import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

import { BlogOrmEntity } from '@/modules/blog/infrastructure/blog.orm-entity';
import { CommentReactionEntity } from '@/modules/comment/infrastructure/comment-reaction.entity';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/comment.orm-entity';
import { PostReactionEntity } from '@/modules/post/infrastructure/post-reaction.entity';
import { PostOrmEntity } from '@/modules/post/infrastructure/post.orm-entity';
import { SessionOrmEntity } from '@/modules/session/infrastructure/session.orm-entity';
import { UserOrmEntity } from '@/modules/user/infrastructure/user.orm-entity';

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
      migrationsRun: false,
    };
  }
}
