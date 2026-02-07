import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { NeedCategory } from '../entities/family-need.entity';

export class FamilyNeedInputDto {
  @IsEnum(NeedCategory)
  category: NeedCategory;

  @IsInt()
  @Min(1)
  @Max(5)
  priority: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpsertFamilyNeedsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => FamilyNeedInputDto)
  needs: FamilyNeedInputDto[];
}
