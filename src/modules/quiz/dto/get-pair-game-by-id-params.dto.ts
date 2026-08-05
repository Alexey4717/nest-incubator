import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetPairGameByIdParamsDto {
  @ApiProperty({ example: '0195e8a0-0000-7000-8000-000000000001' })
  @IsUUID()
  id = '';
}
