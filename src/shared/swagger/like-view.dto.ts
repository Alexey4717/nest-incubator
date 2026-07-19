import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LikeStatus } from '@/modules/like/types/like-status';

export class LikeDetailsViewDto {
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  addedAt = '';

  @ApiPropertyOptional({ example: 'uuid' })
  userId?: string;

  @ApiPropertyOptional({ example: 'userLogin' })
  login?: string;
}

export class LikesInfoViewDto {
  @ApiProperty({ example: 0 })
  likesCount = 0;

  @ApiProperty({ example: 0 })
  dislikesCount = 0;

  @ApiProperty({ enum: LikeStatus, example: LikeStatus.None })
  myStatus: LikeStatus = LikeStatus.None;
}

export class ExtendedLikesInfoViewDto extends LikesInfoViewDto {
  @ApiPropertyOptional({ type: [LikeDetailsViewDto], nullable: true })
  newestLikes?: LikeDetailsViewDto[] | null;
}
