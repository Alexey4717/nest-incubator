import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '@/core/decorators/validation/trim.decorator';

export class SubmitPairGameAnswerDto {
  @ApiProperty({ example: 'Paris' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  answer = '';
}
