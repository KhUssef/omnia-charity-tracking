import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { Family } from './entities/family.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Family])],
  controllers: [FamilyController],
  providers: [FamilyService, RolesGuard],
})
export class FamilyModule {}
