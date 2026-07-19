import { configModule } from '@/dynamic-config-module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule } from '@/core/core.module';

import { BlogModule } from '@/modules/blog/blog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { TypeOrmEntitiesModule } from '@/modules/database/typeorm-entities.module';
import { TypeOrmConfig } from '@/modules/database/typeorm.config';
import { EmailModule } from '@/modules/email/email.module';
import { MailerConfig } from '@/modules/email/mailer.config';
import { PostModule } from '@/modules/post/post.module';
import { SessionModule } from '@/modules/session/session.module';
import { TestingRepository } from '@/modules/testing/infrastructure/testing.repository';
import { UserModule } from '@/modules/user/user.module';

import { SeedService } from './seed.service';

@Module({
  imports: [
    configModule,
    CoreModule,
    DatabaseModule,
    TypeOrmModule.forRootAsync({ imports: [DatabaseModule], useClass: TypeOrmConfig }),
    TypeOrmEntitiesModule,
    CqrsModule,
    SessionModule,
    EmailModule,
    MailerModule.forRootAsync({
      imports: [EmailModule],
      useClass: MailerConfig,
    }),
    UserModule,
    BlogModule,
    PostModule,
    CommentModule,
  ],
  providers: [SeedService, TestingRepository],
})
export class SeedModule {}
