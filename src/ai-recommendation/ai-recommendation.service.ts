import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../family/entities/family.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';
import * as path from 'path';

@Injectable()
export class AiRecommendationService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(AidDistribution)
    private readonly aidDistRepo: Repository<AidDistribution>,
  ) {}

  async getRecommendations(familyId: string) {
    // 1. Récupérer les données nécessaires
    const family = await this.familyRepo.findOne({ where: { id: familyId }, relations: ['visits'] });
    if (!family) return { error: 'Family not found', familyId };
    // Récupérer tous les IDs de visites de la famille
    const visitIds = (family.visits || []).map(v => v.id);
    let aidHistory: AidDistribution[] = [];
    if (visitIds.length > 0) {
      // Utiliser l'opérateur In de TypeORM pour plusieurs IDs
      const { In } = require('typeorm');
      aidHistory = await this.aidDistRepo.find({ where: { visit: { id: In(visitIds) } } });
    }

    // 2. Charger le modèle ML (exemple: simple rules, à remplacer par vrai modèle)
    // Ici, on simule une recommandation simple
    const recommendation = {
      type: 'food',
      amount: 100,
      frequency: 'monthly',
      reason: 'Based on vulnerability and past aid.'
    };

    // 3. Retourner la recommandation
    return {
      familyId,
      recommendation,
      aidHistoryCount: aidHistory.length,
    };
  }
}
