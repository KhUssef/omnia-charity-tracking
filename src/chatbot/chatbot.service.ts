import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  constructor(private readonly configService: ConfigService) {}

  async chat(message: string, history?: { role: string; content: string }[]): Promise<{ reply: string }> {
    const lower = message.toLowerCase();

    // Rule-based responses first
    if (lower.includes('don') || lower.includes('donner') || lower.includes('contribution')) {
      return {
        reply: `Vous pouvez faire un don directement via notre plateforme. Chaque dinar est tracé jusqu'à la famille bénéficiaire grâce à notre système de traçabilité. Rendez-vous sur la page Traçabilité pour voir où va votre argent. Souhaitez-vous être mis en relation avec un responsable ?`,
      };
    }

    if (lower.includes('bénévole') || lower.includes('volontaire') || lower.includes('aider')) {
      return {
        reply: `Merci pour votre engagement ! Nous recherchons toujours des bénévoles pour les visites sur le terrain, la logistique et la coordination. Vous pouvez vous inscrire via la page Visites ou contacter notre équipe à contact@omnia.org.`,
      };
    }

    if (lower.includes('famille') || lower.includes('familles')) {
      return {
        reply: `Nous accompagnons actuellement plusieurs familles en situation de vulnérabilité. Chaque famille reçoit un score objectif basé sur des critères comme le handicap, l'âge, la scolarisation et la taille du foyer. Consultez la page Familles pour en savoir plus.`,
      };
    }

    if (lower.includes('traçabilité') || lower.includes('argent') || lower.includes('fonds')) {
      return {
        reply: `Notre système de traçabilité permet de suivre chaque aide depuis son origine jusqu'à la famille bénéficiaire. Vous pouvez explorer l'arborescence complète sur la page Traçabilité. C'est notre engagement envers la transparence totale.`,
      };
    }

    if (lower.includes('score') || lower.includes('vulnérabilité') || lower.includes('priorité')) {
      return {
        reply: `Notre algorithme calcule un score de vulnérabilité pour chaque famille en combinant des facteurs objectifs : présence d'un membre handicapé (+25), personne âgée (+20), enfant en âge scolaire (+10), et taille de la famille (+8 à +15). Cela permet de cibler l'aide là où elle est la plus urgente.`,
      };
    }

    if (lower.includes('contact') || lower.includes('email') || lower.includes('téléphone')) {
      return {
        reply: `Vous pouvez nous contacter à contact@omnia.org ou via nos réseaux sociaux. Notre siège est situé à Tunis.`,
      };
    }

    if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
      return {
        reply: `Bonjour ! Je suis l'assistant virtuel d'Omnia. Je peux vous renseigner sur les dons, les familles accompagnées, la traçabilité des fonds, ou comment devenir bénévole. Que souhaitez-vous savoir ?`,
      };
    }

    // Try external AI if API key is configured
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `Tu es l'assistant virtuel d'Omnia, une association caritative tunisienne. Tu réponds en français de manière chaleureuse, concise et professionnelle. Tu parles de la transparence des dons, du score de vulnérabilité des familles, et de la planification des visites.`,
              },
              ...(history || []).slice(-4),
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return { reply: data.choices[0].message.content };
        }
      } catch {
        // Fallback to default
      }
    }

    return {
      reply: `Je n'ai pas de réponse précise à cette question, mais je peux vous aider sur :
• Les dons et la traçabilité
• Les familles accompagnées et leurs scores
• Comment devenir bénévole
• La planification des visites

N'hésitez pas à reformuler ou à nous contacter directement.`,
    };
  }
}
