import { HumidityLevel } from '../entities/deposit.entity';
import { IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';

export class RecommendDepositDto {
  @IsNumber()
  quantity: number;

  @IsEnum(HumidityLevel)
  @IsOptional()
  requiredHumidityLevel?: HumidityLevel | null;

  @IsNumber()
  @IsOptional()
  requiredMinTemperatureC?: number | null;

  @IsNumber()
  @IsOptional()
  requiredMaxTemperatureC?: number | null;

  @IsArray()
  @IsOptional()
  requiredCapabilities?: string[];
}
