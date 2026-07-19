import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

import { Trim } from '@/core/decorators/validation/trim.decorator';

export class UpdatePostDto {
  /** Post title (max 30 characters) */
  @ApiProperty({ maxLength: 30, example: 'Post title' })
  @Trim()
  @MaxLength(30)
  @IsString()
  title = '';

  /** Short description (max 100 characters) */
  @ApiProperty({ maxLength: 100, example: 'Short description' })
  @Trim()
  @MaxLength(100)
  @IsString()
  shortDescription = '';

  /** Post content (max 1000 characters) */
  @ApiProperty({ maxLength: 1000, example: 'Post content' })
  @Trim()
  @MaxLength(1000)
  @IsString()
  content = '';

  /** ID of the blog the post belongs to */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  blogId = '';
}
