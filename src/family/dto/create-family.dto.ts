import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyDto {
	@IsString()
	@MaxLength(255)
	lastName: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@IsString()
	@MaxLength(500)
	address: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	numberOfMembers?: number;

	@IsOptional()
	@IsBoolean()
	containsDisabledMember?: boolean;

	@IsOptional()
	@IsBoolean()
	containsElderlyMember?: boolean;

	@IsOptional()
	@IsBoolean()
	containspupilMember?: boolean;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	latitude?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	longitude?: number;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	notes?: string;
}
