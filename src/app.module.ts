import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import configuration from './config/configuration';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfig } from './config/mongoose.config';
import { MailerConfig } from './config/mailer.config';
import { MongooseModelsModule } from './modules/database/mongoose-models.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { BlogModule } from './modules/blog/blog.module';
import { CommentModule } from './modules/comment/comment.module';
import { TestingModule } from './modules/testing/testing.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
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
