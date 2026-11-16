import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiResponse } from '../../../../shared/types';

export class PurchaseCreditsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  packageId!: number;
  @IsString() @IsNotEmpty() fullName!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @Matches(/^\d{11}$/) cpf!: string;
  @IsString() @IsNotEmpty() postalCode!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() number!: string;
  @IsOptional() @IsString() complement?: string;
  @IsString() @IsNotEmpty() neighborhood!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() @Length(2, 2) state!: string;
}

export type CreditPackageResponseData = {
  id: number;
  name: string;
  credits: number;
  pricePerCreditCents: number;
  benefitsDescription: string;
};

export type CreditPurchaseResponseData = {
  id: number;
  packageId: number;
  totalCents: number;
  status: string;
  createdAt: Date;
};

export type ListCreditPackagesResponseDto = ApiResponse<
  CreditPackageResponseData[]
>;
export type CreateCreditPurchaseResponseDto =
  ApiResponse<CreditPurchaseResponseData | null>;
