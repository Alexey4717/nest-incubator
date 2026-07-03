import { configModule } from '@/dynamic-config-module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CoreConfig } from '@/shared/core/core.config';
import { CoreModule } from '@/shared/core/core.module';
import { ErrorExceptionFilter } from '@/shared/exception-filters/http.exception-filter';

import { AuthModule } from '@/modules/auth/auth.module';
import { BlogModule } from '@/modules/blog/blog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { MongooseConfig } from '@/modules/database/mongoose.config';
import { EmailModule } from '@/modules/email/email.module';
import { MailerConfig } from '@/modules/email/mailer.config';
import { PostModule } from '@/modules/post/post.module';
import { SessionModule } from '@/modules/session/session.module';
import { TestingModule } from '@/modules/testing/testing.module';
import { UserModule } from '@/modules/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    configModule,
    CoreModule,
    CqrsModule.forRoot(),
    ServeStaticModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => [
        {
          rootPath: join(__dirname, '..', '..', 'swagger-static'),
          serveRoot: coreConfig.isDevelopment ? '/' : '/swagger',
        },
      ],
      inject: [CoreConfig],
    }),
    DatabaseModule,
    MongooseModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: MongooseConfig,
    }),
    MailerModule.forRootAsync({
      imports: [EmailModule],
      useClass: MailerConfig,
    }),
    TestingModule,
    AuthModule,
    SessionModule,
    EmailModule,
    UserModule,
    PostModule,
    BlogModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorExceptionFilter],
})
export class AppModule {}
