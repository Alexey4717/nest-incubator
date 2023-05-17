import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDTO {
  @Length(3, 10)
  @IsString()
  // @UserLoginExist()
  login: string;

  @Length(6, 20)
  @IsString()
  password: string;

  @IsEmail()
  // @UserEmailExist()
  email: string;
}
