import { Injectable } from '@nestjs/common';
import { CreateAidDto } from './dto/create-aid.dto';
import { UpdateAidDto } from './dto/update-aid.dto';

@Injectable()
export class AidService {
  create(createAidDto: CreateAidDto) {
    return 'This action adds a new aid';
  }

  findAll() {
    return `This action returns all aid`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aid`;
  }

  update(id: number, updateAidDto: UpdateAidDto) {
    return `This action updates a #${id} aid`;
  }

  remove(id: number) {
    return `This action removes a #${id} aid`;
  }
}
