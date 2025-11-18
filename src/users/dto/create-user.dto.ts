import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsNotEmpty()
  gender!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  phoneNumber!: string;

  @IsNotEmpty()
  cidNumber!: string;

  @IsNotEmpty()
  staffId!: string;

  @IsOptional()
  deptName?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  createdBy?: string;

  @IsOptional()
  modifiedBy?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  verificationKey?: string;  

  @IsOptional()
  verificationExpire?: Date;
}
