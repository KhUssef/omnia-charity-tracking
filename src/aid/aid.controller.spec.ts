import { Test, TestingModule } from '@nestjs/testing';
import { AidController } from './aid.controller';
import { AidService } from './aid.service';

describe('AidController', () => {
  let controller: AidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidController],
      providers: [AidService],
    }).compile();

    controller = module.get<AidController>(AidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
