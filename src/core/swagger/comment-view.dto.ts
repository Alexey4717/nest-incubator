import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LikesInfoViewDto } from './like-view.dto';
import { PaginatedMetaDto } from './paginated-meta.dto';

export class CommentatorInfoViewDto {
  @ApiProperty({ example: 'uuid' })
  userId = '';

  @ApiProperty({ example: 'userLogin' })
  userLogin = '';
}

export class CommentViewDto {
  @ApiProperty({ example: 'uuid' })
  id = '';

  @ApiProperty({ example: 'Comment content' })
  content = '';

  @ApiProperty({ type: CommentatorInfoViewDto })
  commentatorInfo = new CommentatorInfoViewDto();

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt = '';

  @ApiPropertyOptional({ type: LikesInfoViewDto })
  likesInfo?: LikesInfoViewDto;
}

export class PaginatedCommentsViewDto extends PaginatedMetaDto {
  @ApiProperty({ type: [CommentViewDto] })
  items: CommentViewDto[] = [];
}
