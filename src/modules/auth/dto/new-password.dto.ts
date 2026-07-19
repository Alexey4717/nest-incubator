import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class NewPasswordDto {
  /** New password (6-20 characters) */
  @ApiProperty({ minLength: 6, maxLength: 20, example: 'newPassword123' })
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  newPassword = '';

  /** Recovery code from email */
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsString()
  recoveryCode = '';
}
