import { Injectable } from '@nestjs/common';
import { CreateAidDistributionDto } from './dto/create-aid-distribution.dto';
import { UpdateAidDistributionDto } from './dto/update-aid-distribution.dto';

@Injectable()
export class AidDistributionService {
  create(createAidDistributionDto: CreateAidDistributionDto) {
    return 'This action adds a new aidDistribution';
  }

  findAll() {
    return `This action returns all aidDistribution`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aidDistribution`;
  }

  update(id: number, updateAidDistributionDto: UpdateAidDistributionDto) {
    return `This action updates a #${id} aidDistribution`;
  }

  remove(id: number) {
    return `This action removes a #${id} aidDistribution`;
  }
}
