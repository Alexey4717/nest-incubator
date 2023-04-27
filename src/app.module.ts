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
import { MongooseConfig } from './configs/mongoose.config';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { BlogModule } from './modules/blog/blog.module';
import { CommentModule } from './modules/comment/comment.module';
import { TestingModule } from './modules/testing/testing.module';
// import { EmailModule } from './modules/email/email.module';

const modules = [
  TestingModule,
  UserModule,
  PostModule,
  BlogModule,
  CommentModule,
  // EmailModule,
];

const guards = [];
const validators = [];

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    // MongooseModule.forRoot(process.env.MONGO_URI),
    ...modules,
  ],
  controllers: [AppController],
  providers: [...guards, ...validators, AppService],

  // use when change DB on SQL
  // providers: [
  //   {
  //     provide: authRepository,
  //     useClass: process.env.DB_TYPE === 'MONGO' ? AuthRepositoryMongo : AuthRepositorySQL
  //   },
  // ],
})
export class AppModule {}
