import { IsString, IsUrl, MaxLength } from 'class-validator';

import { Trim } from '@/shared/decorators/validation/trim.decorator';

export class CreateBlogDTO {
  @Trim()
  @MaxLength(15)
  @IsString()
  name: string;

  @MaxLength(500)
  @IsString()
  description: string;

  @MaxLength(100)
  @IsString()
  @IsUrl()
  websiteUrl: string;
}
