import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ValidationErrorResponseDto } from '@/core/swagger/validation-error.dto';

import { AccessTokenViewDto, MeViewDto } from '@/modules/auth/dto/auth-view.swagger.dto';
import { BlogViewDto, PaginatedBlogsViewDto } from '@/modules/blog/dto/blog-view.swagger.dto';
import {
  CommentViewDto,
  PaginatedCommentsViewDto,
} from '@/modules/comment/dto/comment-view.swagger.dto';
import {
  ExtendedLikesInfoViewDto,
  LikeDetailsViewDto,
  LikesInfoViewDto,
} from '@/modules/like/dto/like-view.swagger.dto';
import { PaginatedPostsViewDto, PostViewDto } from '@/modules/post/dto/post-view.swagger.dto';
import {
  AnswerResultViewDto,
  PaginatedPairGamesViewDto,
  PaginatedTopUsersViewDto,
  PairGameViewDto,
  TopUserStatisticViewDto,
  UserStatisticViewDto,
} from '@/modules/quiz/dto/pair-game-view.swagger.dto';
import {
  PaginatedQuizQuestionsViewDto,
  QuizQuestionViewDto,
} from '@/modules/quiz/dto/quiz-view.swagger.dto';
import { SecurityDeviceViewDto } from '@/modules/security/dto/security-device-view.swagger.dto';
import { PaginatedUsersViewDto, UserViewDto } from '@/modules/user/dto/user-view.swagger.dto';

export const SWAGGER_PATH = 'api';

export function swaggerSetup(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .setVersion('1.0')
    .addBearerAuth()
    .addBasicAuth()
    .addCookieAuth('refreshToken')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      ValidationErrorResponseDto,
      AccessTokenViewDto,
      MeViewDto,
      BlogViewDto,
      PaginatedBlogsViewDto,
      PostViewDto,
      PaginatedPostsViewDto,
      CommentViewDto,
      PaginatedCommentsViewDto,
      UserViewDto,
      PaginatedUsersViewDto,
      SecurityDeviceViewDto,
      LikesInfoViewDto,
      ExtendedLikesInfoViewDto,
      LikeDetailsViewDto,
      QuizQuestionViewDto,
      PaginatedQuizQuestionsViewDto,
      PairGameViewDto,
      PaginatedPairGamesViewDto,
      AnswerResultViewDto,
      UserStatisticViewDto,
      TopUserStatisticViewDto,
      PaginatedTopUsersViewDto,
    ],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'Blogger Swagger',
    swaggerOptions: { withCredentials: true },
  });
}
