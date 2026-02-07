import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class LocationService {
  constructor(private readonly configService: ConfigService) {}

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
}
