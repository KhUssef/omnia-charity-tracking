import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config, DatabaseConfig, GoogleMapsConfig } from './config.interface';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T>(key: string): T {
    const val = this.configService.get<string>(key);
    if(!val) {
        throw new Error(`Key ${key} not found in the configuration`);
    }
    return val as T;
  }

  getDatabaseConfig(): DatabaseConfig {
    // Supporte les variables custom (DATABASE_*) et celles de Railway/MySQL (MYSQL*)
    return {
      host: this.configService.get<string>('DATABASE_HOST')
        || this.configService.get<string>('MYSQLHOST')
        || this.configService.get<string>('MYSQL_HOST')
        || 'localhost',
      port: this.configService.get<number>('DATABASE_PORT')
        || this.configService.get<number>('MYSQLPORT')
        || this.configService.get<number>('MYSQL_PORT')
        || 3306,
      username: this.configService.get<string>('DATABASE_USERNAME')
        || this.configService.get<string>('MYSQLUSER')
        || this.configService.get<string>('MYSQL_USER')
        || 'newuser',
      password: this.configService.get<string>('DATABASE_PASSWORD')
        || this.configService.get<string>('MYSQLPASSWORD')
        || this.configService.get<string>('MYSQL_PASSWORD')
        || 'password',
      database: this.configService.get<string>('DATABASE_NAME')
        || this.configService.get<string>('MYSQLDATABASE')
        || this.configService.get<string>('MYSQL_DATABASE')
        || 'omnia',
    };
  }

  getJwtConfig() {
    return {
      jwtSecret: this.configService.get<string>('JWT_SECRET') || 'yoursecretkey',
      jwtExpiration: this.configService.get<string>('JWT_EXPIRATION') || '1h',
      jwtRefreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'yourrefreshsecretkey',
      jwtRefreshExpiration: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    };
  }

  getGoogleMapsConfig(): GoogleMapsConfig {
    return {
      geocodeBaseUrl:
        this.configService.get<string>('GOOGLE_MAPS_GEOCODE_URL') ||
        'https://nominatim.openstreetmap.org/reverse',
    };
  }
}


