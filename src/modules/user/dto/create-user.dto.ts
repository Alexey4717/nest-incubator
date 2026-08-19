import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDTO {
  /** User login (3-10 characters) */
  @ApiProperty({ minLength: 3, maxLength: 10, example: 'userLogin' })
  @Length(3, 10)
  @IsString()
  login = '';

  /** User password (6-20 characters) */
  @ApiProperty({ minLength: 6, maxLength: 20, example: 'password123' })
  @Length(6, 20)
  @IsString()
  password = '';

  /** User email address */
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email = '';
}
