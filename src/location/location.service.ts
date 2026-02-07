import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpsertCityBoundaryDto } from './dto/upsert-city-boundary.dto';
import { ConfigService } from '../config/config.service';
import { CityBoundary } from './entities/city-boundary.entity';

@Injectable()
export class LocationService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CityBoundary)
    private readonly cityBoundaryRepo: Repository<CityBoundary>,
  ) {}

  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  }

  findAll() {
    return `This action returns all location`;
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }

  /**
   * Uses OpenStreetMap Nominatim (free) to derive
   * city and region from latitude/longitude.
   */
  async getRegionFromCoordinates(
    latitude: number,
    longitude: number,
    language = 'en',
  ): Promise<{ city: string | null; region: string | null }> {
    const url = new URL(this.configService.getGoogleMapsConfig().geocodeBaseUrl);
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', language);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'omnia-backend/1.0',
      },
    });
    if (!response.ok) {
      throw new InternalServerErrorException('Failed to call Nominatim service');
    }
    
    const data: any = await response.json();

    if (!data.address) {
      return { city: null, region: null };
    }

    const address = data.address as {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      region?: string;
      county?: string;
    };

    let city = address.city || address.town || address.village || null;
    let region = address.state || address.region || address.county || null;
    if(!city){
      city = region;
    }
    if(!region){
      region = city;
    }
    return { city, region };
  }

  async upsertCityBoundary(dto: UpsertCityBoundaryDto) {
    let boundary = await this.cityBoundaryRepo.findOne({ where: { city: dto.city } });

    if (!boundary) {
      boundary = this.cityBoundaryRepo.create({
        city: dto.city,
        region: dto.region ?? null,
        countryCode: dto.countryCode ?? null,
        geojson: dto.geojson,
      });
    }

    boundary.geojson = dto.geojson;
    boundary.region = dto.region ?? boundary.region ?? null;
    boundary.countryCode = dto.countryCode ?? boundary.countryCode ?? null;
    boundary.bbox = dto.bbox ?? boundary.bbox ?? null;
    boundary.source = dto.source ?? boundary.source ?? 'manual';
    boundary.externalId = dto.externalId ?? boundary.externalId ?? null;
    boundary.externalType = dto.externalType ?? boundary.externalType ?? null;

    return this.cityBoundaryRepo.save(boundary);
  }

  async getCityBoundary(city: string) {
    return this.cityBoundaryRepo.findOne({ where: { city } });
  }

  async listCityBoundaries() {
    return this.cityBoundaryRepo.find({ order: { city: 'ASC' } });
  }
}
