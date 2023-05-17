import { MaxLength, IsString, IsUrl } from 'class-validator';

export class UpdateBlogDto {
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
