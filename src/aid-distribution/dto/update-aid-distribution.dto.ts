import { PartialType } from '@nestjs/mapped-types';
import { CreateAidDistributionDto } from './create-aid-distribution.dto';

export class UpdateAidDistributionDto extends PartialType(CreateAidDistributionDto) {}
