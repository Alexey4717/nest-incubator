import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateCommentDTO {
  /** Comment content (20-300 characters) */
  @ApiProperty({ minLength: 20, maxLength: 300, example: 'Updated comment content text' })
  @Length(20, 300)
  @IsString()
  content = '';
}
