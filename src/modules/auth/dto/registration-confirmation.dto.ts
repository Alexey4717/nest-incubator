import { IsString, Length } from 'class-validator';

export class RegistrationConfirmationDto {
  @IsString()
  @Length(1, 255)
  code: string;
}
