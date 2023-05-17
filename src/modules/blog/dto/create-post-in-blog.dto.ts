import { MaxLength, IsString } from 'class-validator';

export class CreatePostInBlogDTO {
  @MaxLength(30)
  @IsString()
  title: string;

  @MaxLength(100)
  @IsString()
  shortDescription: string;

  @MaxLength(1000)
  @IsString()
  content: string;
}
