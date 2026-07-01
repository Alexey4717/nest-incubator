import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import configuration from '@/shared/config/configuration';
import { MailerConfig } from '@/shared/config/mailer.config';
import { MongooseConfig } from '@/shared/config/mongoose.config';

import { AuthModule } from '@/modules/auth/auth.module';
import { BlogModule } from '@/modules/blog/blog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { MongooseModelsModule } from '@/modules/database/mongoose-models.module';
import { EmailModule } from '@/modules/email/email.module';
import { PostModule } from '@/modules/post/post.module';
import { SessionModule } from '@/modules/session/session.module';
import { TestingModule } from '@/modules/testing/testing.module';
import { UserModule } from '@/modules/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});

@Module({
  imports: [
    CqrsModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    configModule,
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    MongooseModelsModule,
    MailerModule.forRootAsync({ useClass: MailerConfig }),
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
  providers: [AppService],
})
export class AppModule {}
