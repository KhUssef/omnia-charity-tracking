import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LocationCronService } from '../location/location-cron.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const cronService = app.get(LocationCronService);
    await cronService.backfillCityBoundaries();
    console.log('City boundary backfill completed.');
  } catch (error) {
    console.error('Failed to backfill city boundaries:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main();
