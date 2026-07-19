import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /** Login or email of user */
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  loginOrEmail = '';

  /** Password of user */
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password = '';
}
