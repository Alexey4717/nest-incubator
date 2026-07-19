import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RegistrationConfirmationDto {
  /** Confirmation code from email */
  @ApiProperty({ minLength: 1, maxLength: 255, example: 'confirmation-code' })
  @IsString()
  @Length(1, 255)
  code = '';
}
