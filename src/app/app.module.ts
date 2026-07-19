import { configModule } from '@/dynamic-config-module';
import { MailerModule } from '@nestjs-modules/mailer';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { CoreConfig } from '@/core/core.config';
import { CoreModule } from '@/core/core.module';

import { AuthModule } from '@/modules/auth/auth.module';
import { BlogModule } from '@/modules/blog/blog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { TypeOrmEntitiesModule } from '@/modules/database/typeorm-entities.module';
import { TypeOrmConfig } from '@/modules/database/typeorm.config';
import { EmailModule } from '@/modules/email/email.module';
import { MailerConfig } from '@/modules/email/mailer.config';
import { PostModule } from '@/modules/post/post.module';
import { SecurityModule } from '@/modules/security/security.module';
import { SessionModule } from '@/modules/session/session.module';
import { TestingModule } from '@/modules/testing/testing.module';
import { UserModule } from '@/modules/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SWAGGER_PATH } from './setup/swagger.setup';

@Module({
  imports: [
    configModule,
    CoreModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({ ttl: 10, limit: 5 }),
    CqrsModule.forRoot(),
    ServeStaticModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => [
        {
          rootPath: join(__dirname, '..', '..', 'swagger-static'),
          serveRoot: coreConfig.isDevelopment ? '/' : `/${SWAGGER_PATH}`,
        },
      ],
      inject: [CoreConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forRootAsync({ imports: [DatabaseModule], useClass: TypeOrmConfig }),
    TypeOrmEntitiesModule,
    UserModule,
    SessionModule,
    CommentModule,
    PostModule,
    BlogModule,
    MailerModule.forRootAsync({
      imports: [EmailModule],
      useClass: MailerConfig,
    }),
    AuthModule,
    EmailModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    return {
      module: AppModule,
      imports: coreConfig.includeTestingModule ? [TestingModule] : [],
      providers: coreConfig.ipRestrictionEnabled
        ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
        : [],
    };
  }
}
