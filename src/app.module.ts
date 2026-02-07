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
import { ConfigService } from './config/config.service';
import { Aid } from './aid/entities/aid.entity';
import { AidDistribution } from './aid-distribution/entities/aid-distribution.entity';
import { Family } from './family/entities/family.entity';
import { Visit } from './visit/entities/visit.entity';
import { Location } from './location/entities/location.entity';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.getDatabaseConfig();
        return {
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [User, Aid, AidDistribution, Family, Visit, Location],
          synchronize: true,
        };
      },
    }),AuthModule, FamilyModule, UserModule, VisitModule, LocationModule, AidModule, AidDistributionModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
