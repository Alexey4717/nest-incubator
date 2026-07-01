import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { LikeStatus } from '../types/like-status';

export class LikeInputDto {
  @ApiProperty({
    enum: LikeStatus,
    description: 'Like status of entity (None, Like, Dislike)',
    example: LikeStatus.Like,
  })
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
