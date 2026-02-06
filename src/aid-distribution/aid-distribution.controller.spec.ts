import { Test, TestingModule } from '@nestjs/testing';
import { AidDistributionController } from './aid-distribution.controller';
import { AidDistributionService } from './aid-distribution.service';

describe('AidDistributionController', () => {
  let controller: AidDistributionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidDistributionController],
      providers: [AidDistributionService],
    }).compile();

    controller = module.get<AidDistributionController>(AidDistributionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
