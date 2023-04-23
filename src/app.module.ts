// configs defined first, for get correct access to dotenv in different modules
import { ConfigModule } from '@nestjs/config';
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

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './modules/user/api/user.controller';
import { UserService } from './modules/user/application/user.service';
import { User } from './modules/user/models/User.schema';
import { MongooseConfig } from './configs/mongoose.config';
import { UserModule } from './modules/user/user.module';
import { UserQueryRepository } from './modules/user/infrastructure/user-query.repository';
import { UserRepository } from './modules/user/infrastructure/user.repository';
import { EmailService } from './services/email.service';
import { EmailManager } from './managers/email.manager';
import { EmailAdapter } from './adapters/email.adapter';
import { PostModule } from './modules/post/post.module';
import { BlogModule } from './modules/blog/blog.module';
import { BlogService } from './modules/blog/application/blog.service';
import { BlogRepository } from './modules/blog/infrastructure/blog.repository';
import { BlogController } from './modules/blog/api/blog.controller';
import { BlogQueryRepository } from './modules/blog/infrastructure/blog-query.repository';
import { PostController } from './modules/post/api/post.controller';
import { PostService } from './modules/post/application/post.service';
import { PostRepository } from './modules/post/infrastructure/post.repository';
import { PostQueryRepository } from './modules/post/infrastructure/post-query.repository';
import { CommentModule } from './modules/comment/comment.module';
import { CommentController } from './modules/comment/api/comment.controller';
import { CommentService } from './modules/comment/application/comment.service';
import { CommentQueryRepository } from './modules/comment/infrastructure/comment-query.repository';
import { CommentRepository } from './modules/comment/infrastructure/comment.repository';

const config = configurations();

const controllers = [
  AppController,
  UserController,
  BlogController,
  PostController,
  CommentController,
];

const guards = [];
const validators = [];
const services = [
  AppService,
  UserService,
  EmailService,
  BlogService,
  PostService,
  CommentService,
];
const managers = [EmailManager];
const adapters = [EmailAdapter];
const queryRepositories = [
  UserQueryRepository,
  BlogQueryRepository,
  PostQueryRepository,
  CommentQueryRepository,
];
const repositories = [
  UserRepository,
  BlogRepository,
  PostRepository,
  CommentRepository,
];

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    MongooseModule.forRoot(config.MONGO_URI, {
      dbName: config.DB_NAME,
      loggerLevel: 'debug',
    }),
    MongooseModule.forFeature([{ name: User.name, schema: User }]),
    UserModule,
    PostModule,
    BlogModule,
    CommentModule,
  ],
  controllers,
  providers: [
    ...guards,
    ...validators,
    ...services,
    ...queryRepositories,
    ...repositories,
    ...managers,
    ...adapters,
  ],

  // use when change DB on SQL
  // providers: [
  //   {
  //     provide: authRepository,
  //     useClass: process.env.DB_TYPE === 'MONGO' ? AuthRepositoryMongo : AuthRepositorySQL
  //   },
  // ],
})
export class AppModule {}
