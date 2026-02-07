import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { HumidityLevel } from '../entities/deposit.entity';

export class CreateDepositDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsNumber()
  @IsOptional()
  currentQuantity?: number;

  @IsNumber()
  @IsOptional()
  minTemperatureC?: number;

  @IsNumber()
  @IsOptional()
  maxTemperatureC?: number;

  @IsEnum(HumidityLevel)
  @IsOptional()
  humidityLevel?: HumidityLevel;

  @IsBoolean()
  @IsOptional()
  isRefrigerated?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  containerImageUrl?: string;
}
