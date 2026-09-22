import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { DonationJourney } from '../components/DonationJourney';
import { PulseFeed } from '../components/PulseFeed';
import { PARTNERS } from '../data/omnia';
import { HomeHero } from '../components/home/HomeHero';
import { BentoEngage } from '../components/home/BentoEngage';
import { MissionPanel } from '../components/home/MissionPanel';
import { CausesGrid } from '../components/home/CausesGrid';
import { DonationBanner } from '../components/home/DonationBanner';

export function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <HomeHero stats={stats} />

      <section className="section-sky">
        <div className="max-w-3xl mx-auto px-6 text-center py-12 md:py-16">
          <p className="text-gold-500 text-4xl font-serif leading-none mb-4">“</p>
          <h2 className="text-2xl md:text-4xl font-bold text-navy-900 leading-tight">
            Embrasser l’inconfort pour conduire un changement réel et un avenir plus lumineux.
          </h2>
        </div>
      </section>

      <BentoEngage />
      <MissionPanel />
      <CausesGrid stats={stats} />

      <section className="section-sky pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonationBanner
            variant="gold"
            title="Votre don donne du pouvoir à ceux qui en ont besoin"
            body="Rejoignez Omnia : un don tracé jusqu’à une famille tunisienne."
          />
        </div>
      </section>

      <section className="section-sky pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <DonationJourney />
          </div>
          <div className="lg:col-span-2">
            <PulseFeed items={stats?.recentDistributions ?? []} />
          </div>
        </div>
      </section>

      <section id="partenaires" className="bg-white py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">Ils nous font confiance</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy-900 mb-8">Nos partenaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PARTNERS.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="surface-card rounded-2xl px-5 py-7 text-center"
              >
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-gold-400 text-sm font-bold">
                  {name.slice(0, 1)}
                </span>
                <p className="font-semibold text-navy-800">{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
