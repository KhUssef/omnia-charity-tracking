import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aid } from '../aid/entities/aid.entity';
import { AidDistribution } from '../aid-distribution/entities/aid-distribution.entity';

export interface TraceabilityNode {
  id: string;
  type: 'aid' | 'distribution' | 'visit' | 'family';
  name: string;
  date?: string;
  details?: string;
  children?: TraceabilityNode[];
}

@Injectable()
export class TraceabilityService {
  constructor(
    @InjectRepository(Aid)
    private readonly aidRepository: Repository<Aid>,
    @InjectRepository(AidDistribution)
    private readonly distributionRepository: Repository<AidDistribution>,
  ) {}

  async getTraceability(aidId?: string): Promise<TraceabilityNode[]> {
    const aids = aidId
      ? await this.aidRepository.find({ where: { id: aidId }, relations: ['distributions', 'distributions.visit', 'distributions.visit.families'] })
      : await this.aidRepository.find({ relations: ['distributions', 'distributions.visit', 'distributions.visit.families'] });

    if (aids.length === 0) {
      // Return mock data for demo
      return [
        {
          id: 'mock-aid-1',
          type: 'aid',
          name: 'Colis Alimentaire Ramadan',
          details: 'Type: Nourriture',
          children: [
            {
              id: 'mock-dist-1',
              type: 'distribution',
              name: 'Distribution #1',
              date: new Date().toISOString(),
              details: 'Quantité: 50 colis',
              children: [
                {
                  id: 'mock-visit-1',
                  type: 'visit',
                  name: 'Visite du 15 mars 2024',
                  date: new Date().toISOString(),
                  details: 'Bénévole: Ahmed K.',
                  children: [
                    {
                      id: 'mock-family-1',
                      type: 'family',
                      name: 'Famille Ben Ali',
                      details: '7 membres, Tunis',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'mock-aid-2',
          type: 'aid',
          name: 'Aide Médicamenteuse',
          details: 'Type: Médicaments',
          children: [
            {
              id: 'mock-dist-2',
              type: 'distribution',
              name: 'Distribution #2',
              date: new Date(Date.now() - 86400000 * 5).toISOString(),
              details: 'Quantité: 25 kits',
              children: [
                {
                  id: 'mock-visit-2',
                  type: 'visit',
                  name: 'Visite du 10 mars 2024',
                  date: new Date(Date.now() - 86400000 * 5).toISOString(),
                  details: 'Bénévole: Sarah M.',
                  children: [
                    {
                      id: 'mock-family-2',
                      type: 'family',
                      name: 'Famille Trabelsi',
                      details: '5 membres, Sfax',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
    }

    return aids.map((aid) => ({
      id: aid.id,
      type: 'aid' as const,
      name: aid.name,
      details: `Type: ${aid.type}`,
      children: (aid.distributions || []).map((dist) => ({
        id: dist.id,
        type: 'distribution' as const,
        name: `Distribution ${dist.id.slice(0, 6)}`,
        date: dist.createdAt ? new Date(dist.createdAt).toISOString() : undefined,
        details: `Quantité: ${dist.quantity}`,
        children: dist.visit
          ? [
              {
                id: dist.visit.id,
                type: 'visit' as const,
                name: `Visite du ${new Date(dist.visit.startDate).toLocaleDateString('fr-FR')}`,
                date: new Date(dist.visit.startDate).toISOString(),
                details: dist.visit.notes || 'Visite effectuée',
                children: dist.visit.families?.length
                  ? [
                      {
                        id: dist.visit.families[0].id,
                        type: 'family' as const,
                        name: `Famille ${dist.visit.families[0].lastName}`,
                        details: `${dist.visit.families[0].numberOfMembers} membres, ${dist.visit.families[0].address}`,
                      },
                    ]
                  : undefined,
              },
            ]
          : undefined,
      })),
    }));
  }
}
