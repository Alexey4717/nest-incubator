import { IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @MaxLength(30)
  @IsString()
  title: string;

  @MaxLength(100)
  @IsString()
  shortDescription: string;

  @MaxLength(1000)
  @IsString()
  content: string;

  @IsString()
  blogId: string;
}
