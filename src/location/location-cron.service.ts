import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CityBoundary } from './entities/city-boundary.entity';

interface NominatimBoundaryResponse {
  geojson: Record<string, unknown>;
  boundingbox?: string[];
  osm_id?: number;
  osm_type?: string;
  address?: {
    state?: string;
    region?: string;
    county?: string;
    country_code?: string;
  };
}

@Injectable()
export class LocationCronService {
  private readonly logger = new Logger(LocationCronService.name);
  private static readonly NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(CityBoundary)
    private readonly cityBoundaryRepo: Repository<CityBoundary>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async backfillCityBoundaries() {
    const rows = await this.locationRepo
      .createQueryBuilder('location')
      .select('DISTINCT location.city', 'city')
      .where('location.city IS NOT NULL')
      .getRawMany();

    for (const row of rows) {
      const city = row.city as string | null;
      if (!city) {
        continue;
      }

      const exists = await this.cityBoundaryRepo.findOne({ where: { city } });
      if (exists) {
        continue;
      }

      await this.sleep(1000);
      const boundary = await this.fetchBoundary(city);
      if (!boundary) {
        this.logger.warn(`No boundary found for city ${city}`);
        continue;
      }

      await this.cityBoundaryRepo.save(
        this.cityBoundaryRepo.create({
          city,
          region:
            boundary.address?.state || boundary.address?.region || boundary.address?.county || null,
          countryCode: boundary.address?.country_code?.toUpperCase() ?? null,
          geojson: boundary.geojson,
          bbox: this.parseBoundingBox(boundary.boundingbox),
          source: 'nominatim',
          externalId: boundary.osm_id ? String(boundary.osm_id) : null,
          externalType: boundary.osm_type ?? null,
        }),
      );
    }
  }

  private async fetchBoundary(city: string) {
    const url = new URL(LocationCronService.NOMINATIM_SEARCH_URL);
    url.searchParams.set('format', 'json');
    url.searchParams.set('polygon_geojson', '1');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('city', city);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'omnia-backend/1.0',
      },
    });

    if (!response.ok) {
      this.logger.error(`Failed to fetch boundary for ${city}: ${response.statusText}`);
      return null;
    }

    const payload = (await response.json()) as NominatimBoundaryResponse[];
    if (!Array.isArray(payload) || payload.length === 0 || !payload[0]?.geojson) {
      return null;
    }

    return payload[0];
  }

  private parseBoundingBox(values?: string[]) {
    if (!Array.isArray(values) || values.length !== 4) {
      return null;
    }
    return values.map((value) => Number.parseFloat(value)) as [number, number, number, number];
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
