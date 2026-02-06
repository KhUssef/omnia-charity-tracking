import { Test, TestingModule } from '@nestjs/testing';
import { AidDistributionService } from './aid-distribution.service';

describe('AidDistributionService', () => {
  let service: AidDistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AidDistributionService],
    }).compile();

    service = module.get<AidDistributionService>(AidDistributionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
