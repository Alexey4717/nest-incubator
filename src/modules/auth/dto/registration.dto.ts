import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

import { UserEmailExist } from '@/modules/user/decorators/user-email-exist.decorator';
import { UserLoginExist } from '@/modules/user/decorators/user-login-exist.decorator';

export class RegistrationDto {
  /** User login (3-10 characters) */
  @ApiProperty({ minLength: 3, maxLength: 10, example: 'userLogin' })
  @IsString()
  @Length(3, 10)
  @UserLoginExist()
  login = '';

  /** User email address */
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @UserEmailExist()
  email = '';

  /** User password (6-20 characters) */
  @ApiProperty({ minLength: 6, maxLength: 20, example: 'password123' })
  @IsString()
  @Length(6, 20)
  password = '';
}
