import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../family/entities/family.entity';
import { VulnerabilityService } from '../vulnerability/vulnerability.service';

export interface VisitPlanItem {
  familyId: string;
  familyName: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: number;
  distance?: number;
}

@Injectable()
export class VisitPlanService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    private readonly vulnerabilityService: VulnerabilityService,
  ) {}

  async generatePlan(workerLat?: number, workerLng?: number): Promise<VisitPlanItem[]> {
    const families = await this.familyRepository.find({ relations: ['location'] });
    const scores = await this.vulnerabilityService.calculateScores();
    const scoreMap = new Map(scores.map((s) => [s.familyId, s.score]));

    if (families.length === 0) {
      return this.getMockPlan(workerLat, workerLng);
    }

    const items: VisitPlanItem[] = families.map((family) => {
      const lat = family.location?.latitude ?? 36.8 + (Math.random() - 0.5) * 0.5;
      const lng = family.location?.longitude ?? 10.18 + (Math.random() - 0.5) * 0.5;
      const priority = scoreMap.get(family.id) || 30;

      let distance: number | undefined;
      if (workerLat !== undefined && workerLng !== undefined) {
        distance = this.haversine(workerLat, workerLng, lat, lng);
      }

      return {
        familyId: family.id,
        familyName: family.lastName,
        address: family.address,
        latitude: lat,
        longitude: lng,
        priority,
        distance,
      };
    });

    // Sort: by distance if provided, else by priority descending
    if (workerLat !== undefined && workerLng !== undefined) {
      items.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else {
      items.sort((a, b) => b.priority - a.priority);
    }

    return items;
  }

  private getMockPlan(workerLat?: number, workerLng?: number): VisitPlanItem[] {
    const items: VisitPlanItem[] = [
      { familyId: 'm1', familyName: 'Ben Ali', address: 'Tunis, Médina', latitude: 36.8065, longitude: 10.1815, priority: 92 },
      { familyId: 'm2', familyName: 'Trabelsi', address: 'Tunis, Le Bardo', latitude: 36.81, longitude: 10.14, priority: 68 },
      { familyId: 'm3', familyName: 'Gharbi', address: 'Tunis, Ariana', latitude: 36.85, longitude: 10.19, priority: 45 },
      { familyId: 'm4', familyName: 'Masmoudi', address: 'Tunis, La Marsa', latitude: 36.876, longitude: 10.325, priority: 38 },
      { familyId: 'm5', familyName: 'Karray', address: 'Tunis, Carthage', latitude: 36.853, longitude: 10.323, priority: 55 },
    ];

    if (workerLat !== undefined && workerLng !== undefined) {
      items.forEach((item) => {
        item.distance = this.haversine(workerLat, workerLng, item.latitude, item.longitude);
      });
      items.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else {
      items.sort((a, b) => b.priority - a.priority);
    }

    return items;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
