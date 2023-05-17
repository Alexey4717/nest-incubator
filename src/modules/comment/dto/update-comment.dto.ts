import { IsString, Length } from 'class-validator';

export class UpdateCommentDTO {
  @Length(20, 300)
  @IsString()
  content: string;
}
