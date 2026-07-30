import { configModule } from '@/dynamic-config-module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule } from '@/core/core.module';

import { BlogModule } from '@/modules/blog/blog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { EmailModule } from '@/modules/email/email.module';
import { MailerConfig } from '@/modules/email/mailer.config';
import { PostModule } from '@/modules/post/post.module';
import { SessionModule } from '@/modules/session/session.module';
import { TestingModule } from '@/modules/testing/testing.module';
import { UserModule } from '@/modules/user/user.module';

import { DatabaseModule } from '../database.module';
import { TypeOrmConfig } from '../typeorm.config';
import { SeedService } from './seed.service';

@Module({
  imports: [
    configModule,
    CoreModule,
    DatabaseModule,
    TypeOrmModule.forRootAsync({ imports: [DatabaseModule], useClass: TypeOrmConfig }),
    ThrottlerModule.forRoot({ ttl: 10, limit: 5 }),
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
    TestingModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
