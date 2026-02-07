import {
	IsBoolean,
	IsDate,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVisitDto {
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startDate?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endDate?: Date;

	@IsOptional()
	@MaxLength(2000)
	@IsString()
	notes?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	latitude?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	longitude?: number;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsBoolean()
	isCompleted?: boolean;
}
