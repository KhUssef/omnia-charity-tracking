import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AidDistributionModule } from './aid-distribution/aid-distribution.module';
import { AidModule } from './aid/aid.module';
import { LocationModule } from './location/location.module';
import { VisitModule } from './visit/visit.module';
import { UserModule } from './user/user.module';
import { FamilyModule } from './family/family.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Aid } from './aid/entities/aid.entity';
import { AidDistribution } from './aid-distribution/entities/aid-distribution.entity';
import { Family } from './family/entities/family.entity';
import { FamilyNeed } from './family/entities/family-need.entity';
import { Visit } from './visit/entities/visit.entity';
import { VisitAidStat } from './dashboard/entities/visit-aid-stat.entity';
import { Location } from './location/entities/location.entity';
import { CityBoundary } from './location/entities/city-boundary.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './dashboard/dashboard.module';
import { Deposit } from './deposit/entities/deposit.entity';
import { DepositModule } from './deposit/deposit.module';
import { DepositStorageStat } from './dashboard/entities/deposit-storage-stat.entity';
import { AiRecommendationModule } from './ai-recommendation/ai-recommendation.module';

// Lecture directe de process.env pour Railway (évite tout problème de ConfigModule)
const dbHost = process.env.DATABASE_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const dbPort = parseInt(process.env.DATABASE_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10);
const dbUser = process.env.DATABASE_USERNAME || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const dbPass = process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'root';
const dbName = process.env.DATABASE_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'omnia';

@Module({
  imports: [ConfigModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPass,
      database: dbName,
      entities: [User, Aid, AidDistribution, Family, FamilyNeed, Visit, Location, VisitAidStat, CityBoundary, Deposit, DepositStorageStat],
      synchronize: true,
    }),
    AuthModule, FamilyModule, UserModule, VisitModule, LocationModule, AidModule, AidDistributionModule, DashboardModule, DepositModule, AiRecommendationModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
