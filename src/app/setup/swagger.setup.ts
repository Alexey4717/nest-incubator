import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AccessTokenViewDto, MeViewDto } from '@/core/swagger/auth-view.dto';
import { BlogViewDto, PaginatedBlogsViewDto } from '@/core/swagger/blog-view.dto';
import { CommentViewDto, PaginatedCommentsViewDto } from '@/core/swagger/comment-view.dto';
import {
  ExtendedLikesInfoViewDto,
  LikeDetailsViewDto,
  LikesInfoViewDto,
} from '@/core/swagger/like-view.dto';
import { AnswerResultViewDto, PairGameViewDto } from '@/core/swagger/pair-game-view.dto';
import { PaginatedPostsViewDto, PostViewDto } from '@/core/swagger/post-view.dto';
import { PaginatedQuizQuestionsViewDto, QuizQuestionViewDto } from '@/core/swagger/quiz-view.dto';
import { SecurityDeviceViewDto } from '@/core/swagger/security-device-view.dto';
import { PaginatedUsersViewDto, UserViewDto } from '@/core/swagger/user-view.dto';
import { ValidationErrorResponseDto } from '@/core/swagger/validation-error.dto';

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
      AnswerResultViewDto,
    ],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'Blogger Swagger',
    swaggerOptions: { withCredentials: true },
  });
}
