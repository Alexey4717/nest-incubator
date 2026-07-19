import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MaxLength } from 'class-validator';

import { Trim } from '@/core/decorators/validation/trim.decorator';

export class CreateBlogDTO {
  /** Blog name (max 15 characters) */
  @ApiProperty({ maxLength: 15, example: 'Blog name' })
  @Trim()
  @MaxLength(15)
  @IsString()
  name = '';

  /** Blog description (max 500 characters) */
  @ApiProperty({ maxLength: 500, example: 'Blog description' })
  @MaxLength(500)
  @IsString()
  description = '';

  /** Blog website URL (max 100 characters) */
  @ApiProperty({ maxLength: 100, example: 'https://example.com' })
  @MaxLength(100)
  @IsString()
  @IsUrl()
  websiteUrl = '';
}
