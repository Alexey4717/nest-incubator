import { ApiProperty } from '@nestjs/swagger';

export class FieldErrorDto {
  @ApiProperty({ example: 'Invalid value' })
  message = '';

  @ApiProperty({ example: 'email' })
  field = '';
}

export class ValidationErrorResponseDto {
  @ApiProperty({ type: [FieldErrorDto] })
  errorsMessages: FieldErrorDto[] = [];
}
