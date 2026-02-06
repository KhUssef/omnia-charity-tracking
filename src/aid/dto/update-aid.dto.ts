import { PartialType } from '@nestjs/mapped-types';
import { CreateAidDto } from './create-aid.dto';

export class UpdateAidDto extends PartialType(CreateAidDto) {}
