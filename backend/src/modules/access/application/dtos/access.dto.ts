import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export enum RegistrationRole {
  LAWYER = 'LAWYER',
  COMMON = 'COMMON',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 160)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsEnum(RegistrationRole)
  role!: RegistrationRole;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos.' })
  cpf!: string;

  @IsOptional()
  @IsString()
  @Length(4, 30)
  oab?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class RefreshSessionDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
