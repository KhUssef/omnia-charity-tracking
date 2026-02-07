import { IsArray, IsDate, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVisitDto {
	@Type(() => Date)
	@IsDate()
	startDate: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endDate?: Date;

	@IsOptional()
	@MaxLength(2000)
	@IsString()
	notes?: string;

	@IsOptional()
	@IsArray()
	@IsUUID(undefined, { each: true })
	userIds?: string[];

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	latitude?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	longitude?: number;
}
