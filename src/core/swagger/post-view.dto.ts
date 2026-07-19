import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ExtendedLikesInfoViewDto } from './like-view.dto';
import { PaginatedMetaDto } from './paginated-meta.dto';

export class PostViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'Post title' })
  title = '';

  @ApiProperty({ example: 'Short description' })
  shortDescription = '';

  @ApiProperty({ example: 'Post content' })
  content = '';

  @ApiProperty({ example: 'uuid' })
  blogId = '';

  @ApiProperty({ example: 'Blog name' })
  blogName = '';

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  createdAt?: string;

  @ApiProperty({ type: ExtendedLikesInfoViewDto })
  extendedLikesInfo = new ExtendedLikesInfoViewDto();
}

export class PaginatedPostsViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [PostViewDto] })
  items: PostViewDto[] = [];
}
