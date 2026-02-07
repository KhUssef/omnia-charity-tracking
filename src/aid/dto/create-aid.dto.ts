import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { AidType } from '../aid.types';
import { HumidityLevel } from '../../deposit/entities/deposit.entity';

export class CreateAidDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsEnum(AidType)
	type: AidType;

	@IsString()
	@IsOptional()
	description?: string;

	@IsInt()
	@IsPositive()
	quantity: number;

	@IsUUID()
	depositId: string;

	@IsOptional()
	@IsBoolean()
	requiresRefrigeration?: boolean;

	@IsOptional()
	@IsEnum(HumidityLevel)
	requiredHumidityLevel?: HumidityLevel | null;

	@IsOptional()
	@Min(-50)
	@Max(80)
	requiredMinTemperatureC?: number | null;

	@IsOptional()
	@Min(-50)
	@Max(80)
	requiredMaxTemperatureC?: number | null;
}
