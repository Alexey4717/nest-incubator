import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RegistrationEmailResendingDto {
  /** Email for resending confirmation */
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email = '';
}
