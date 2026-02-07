import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertCityBoundaryDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsObject()
  geojson: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  bbox?: [number, number, number, number];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  externalType?: string;
}
