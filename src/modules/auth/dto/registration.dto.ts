import { IsEmail, IsString, Length } from 'class-validator';

import { UserEmailExist } from '@/modules/user/decorators/user-email-exist.decorator';
import { UserLoginExist } from '@/modules/user/decorators/user-login-exist.decorator';

export class RegistrationDto {
  @IsString()
  @Length(3, 10)
  @UserLoginExist()
  login: string;
  @IsEmail()
  @UserEmailExist()
  email: string;
  @IsString()
  @Length(6, 20)
  password: string;
}
