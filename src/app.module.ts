import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';
import { AidDistributionModule } from './aid-distribution/aid-distribution.module';
import { AidModule } from './aid/aid.module';
import { LocationModule } from './location/location.module';
import { VisitModule } from './visit/visit.module';
import { UserModule } from './user/user.module';
import { FamilyModule } from './family/family.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, MembersModule, UsersModule, FamilyModule, UserModule, VisitModule, LocationModule, AidModule, AidDistributionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
