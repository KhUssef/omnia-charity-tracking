import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Visit } from '../visit/entities/visit.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Visit])],
  controllers: [UserController],
  providers: [UserService, RolesGuard],
})
export class UserModule {}
