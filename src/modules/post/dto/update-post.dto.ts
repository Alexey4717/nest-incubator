import { IsString, MaxLength } from 'class-validator';

import { Trim } from '@/shared/decorators/validation/trim.decorator';

export class UpdatePostDto {
  @Trim()
  @MaxLength(30)
  @IsString()
  title: string;

  @Trim()
  @MaxLength(100)
  @IsString()
  shortDescription: string;

  @Trim()
  @MaxLength(1000)
  @IsString()
  content: string;

  @IsString()
  blogId: string;
}
