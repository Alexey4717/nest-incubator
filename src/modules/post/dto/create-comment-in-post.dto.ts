import { IsString, Length } from 'class-validator';

export class CreateCommentInPostDto {
  @Length(20, 300)
  @IsString()
  content: string;
}
