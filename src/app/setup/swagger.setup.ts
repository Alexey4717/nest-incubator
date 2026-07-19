import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AccessTokenViewDto, MeViewDto } from '@/shared/swagger/auth-view.dto';
import { BlogViewDto, PaginatedBlogsViewDto } from '@/shared/swagger/blog-view.dto';
import { CommentViewDto, PaginatedCommentsViewDto } from '@/shared/swagger/comment-view.dto';
import {
  ExtendedLikesInfoViewDto,
  LikeDetailsViewDto,
  LikesInfoViewDto,
} from '@/shared/swagger/like-view.dto';
import { PaginatedPostsViewDto, PostViewDto } from '@/shared/swagger/post-view.dto';
import { SecurityDeviceViewDto } from '@/shared/swagger/security-device-view.dto';
import { PaginatedUsersViewDto, UserViewDto } from '@/shared/swagger/user-view.dto';
import { ValidationErrorResponseDto } from '@/shared/swagger/validation-error.dto';

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
    ],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'Blogger Swagger',
    swaggerOptions: { withCredentials: true },
  });
}
