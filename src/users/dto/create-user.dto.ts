import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  phoneNumber!: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  isActive?: boolean;
}
