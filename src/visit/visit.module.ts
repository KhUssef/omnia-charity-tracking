import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit } from './entities/visit.entity';
import { User } from '../user/entities/user.entity';
import { VisitTasksService } from './visit-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Visit, User])],
  controllers: [VisitController],
  providers: [VisitService, VisitTasksService],
})
export class VisitModule {}
