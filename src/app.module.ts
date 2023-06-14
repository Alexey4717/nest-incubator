// configs defined first, for get correct access to dotenv in different modules
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import configurations from './configs/nest.config';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configurations],
  // https://docs.nestjs.com/techniques/configuration#custom-env-file-path
  // можно менять приоритетность мест, откуда брать данные. Приоритет имеет первый
  // envFilePath: ['.env.local', '.env'],
  // envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env'
});

// можно вынести это определение в отдельный файл и потом юзать здесь
// let envFilePath = '.env'
// switch (process.env.NODE_ENV) {
//   case 'dev':
//     envFilePath = '.env.dev';
//     break;
//   case 'prod':
//     envFilePath = '.env.prod';
//     break;
//   default:
//     envFilePath = '.env';
// }
// export envFilePath;

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfig } from './configs/mongoose.config';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { BlogModule } from './modules/blog/blog.module';
import { CommentModule } from './modules/comment/comment.module';
import { TestingModule } from './modules/testing/testing.module';
import { BlogController } from './modules/blog/api/blog.controller';
import { BlogService } from './modules/blog/application/blog.service';
import { BlogRepository } from './modules/blog/infrastructure/blog.repository';
import { BlogQueryRepository } from './modules/blog/infrastructure/blog-query.repository';
import { CommentController } from './modules/comment/api/comment.controller';
import { CommentService } from './modules/comment/application/comment.service';
import { CommentQueryRepository } from './modules/comment/infrastructure/comment-query.repository';
import { CommentRepository } from './modules/comment/infrastructure/comment.repository';
import { PostController } from './modules/post/api/post.controller';
import { PostService } from './modules/post/application/post.service';
import { PostRepository } from './modules/post/infrastructure/post.repository';
import { PostQueryRepository } from './modules/post/infrastructure/post-query.repository';
import { TestingController } from './modules/testing/api/testing.controller';
import { TestingRepository } from './modules/testing/infrastructure/testing.repository';
import { UserController } from './modules/user/api/user.controller';
import { UserService } from './modules/user/application/user.service';
import { UserRepository } from './modules/user/infrastructure/user.repository';
import { UserQueryRepository } from './modules/user/infrastructure/user-query.repository';
import { User, UserSchema } from './modules/user/models/User.schema';
import {
  Comment,
  CommentSchema,
} from './modules/comment/models/Comment.schema';
import { Blog, BlogSchema } from './modules/blog/models/Blog.schema';
import { Post, PostSchema } from './modules/post/models/Post.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerConfig } from './configs/mailer.config';
import { AuthController } from './modules/auth/api/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { AuthService } from './modules/auth/application/auth.service';
import { EmailService } from './modules/email/email.service';
import { SessionModule } from './modules/session/session.module';
import { SessionService } from './modules/session/application/session.service';
import { SessionRepository } from './modules/session/infrastructure/session.repository';
import { SessionQueryRepository } from './modules/session/infrastructure/session-query.repository';
import {
  Session,
  SessionSchema,
} from './modules/session/models/session.schema';

const modules = [
  TestingModule,
  AuthModule,
  SessionModule,
  UserModule,
  PostModule,
  BlogModule,
  CommentModule,
  EmailModule,
];

const controllers = [
  AppController,
  AuthController,
  TestingController,
  UserController,
  BlogController,
  CommentController,
  PostController,
];

const guards = [];
const validators = [];

const services = [
  AppService,
  AuthService,
  SessionService,
  EmailService,
  UserService,
  BlogService,
  CommentService,
  PostService,
];

const queryRepositories = [
  UserQueryRepository,
  SessionQueryRepository,
  BlogQueryRepository,
  CommentQueryRepository,
  PostQueryRepository,
];

const repositories = [
  TestingRepository,
  UserRepository,
  SessionRepository,
  BlogRepository,
  CommentRepository,
  PostRepository,
  ...queryRepositories,
];

const mongooseModels = [
  { name: User.name, schema: UserSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Session.name, schema: SessionSchema },
];

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    configModule,
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    MongooseModule.forFeature(mongooseModels),
    MailerModule.forRootAsync({ useClass: MailerConfig }),
    // MongooseModule.forRoot(process.env.MONGO_URI),
    ...modules,
  ],
  controllers,
  providers: [...guards, ...validators, ...services, ...repositories],

  // use when change DB on SQL
  // providers: [
  //   {
  //     provide: authRepository,
  //     useClass: process.env.DB_TYPE === 'MONGO' ? AuthRepositoryMongo : AuthRepositorySQL
  //   },
  // ],
})
export class AppModule {}
