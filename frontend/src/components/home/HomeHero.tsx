import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '../../types';
import heroDonation from '../../assets/images/hero-donation.png';
import { PillButton } from '../ui/PillButton';
import { Sparkle } from '../decor/Ornaments';

export function HomeHero({ stats }: { stats: DashboardStats | null }) {
  const families = stats?.totalFamilies ?? 0;
  const distributions = stats?.totalAidDistributions ?? 0;
  const visits = stats?.totalVisits ?? 0;
  const donors = Math.max(families * 8, 200);

  return (
    <section className="relative overflow-hidden section-navy">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="eyebrow text-gold-400 mb-4"
            >
              Association humanitaire · Tunisie
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-[3.4rem] font-bold leading-[1.08] tracking-tight text-white"
            >
              Aidez-nous à bâtir
              <br />
              <span className="text-gold-400">espoir</span>
              <span className="text-white"> et foyers</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-5 text-base md:text-lg text-[#c9d4ea] max-w-md leading-relaxed"
            >
              Omnia accompagne les familles précaires en Tunisie. Chaque don est suivi jusqu’au foyer — nourriture, abri, scolarité.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mt-8 flex flex-wrap gap-3">
              <PillButton href="#causes">Voir les causes</PillButton>
              <PillButton to="/contact#don" variant="outline-white">Faire un don</PillButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid grid-cols-2 gap-4 max-w-sm"
            >
              <div>
                <p className="text-3xl font-bold text-gold-400">
                  {Math.max(distributions, 1).toLocaleString('fr-FR')}+
                </p>
                <p className="mt-1 text-xs text-[#c9d4ea]">Contributions reçues</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{visits.toLocaleString('fr-FR')}</p>
                <p className="mt-1 text-xs text-[#c9d4ea]">Visites sur le terrain</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {['LM', 'AY', 'ST', 'KH'].map((initials, i) => (
                  <span
                    key={initials}
                    className="h-9 w-9 rounded-full border-2 border-[#1b2a4a] flex items-center justify-center text-[10px] font-bold text-navy-900"
                    style={{ background: i % 2 ? '#F5C242' : '#E8EEFC' }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 text-gold-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#c9d4ea]">La confiance de {donors.toLocaleString('fr-FR')}+ donateurs</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center justify-center min-h-[340px]"
          >
            <Sparkle className="absolute right-6 top-2 w-7 h-7 text-gold-400 pointer-events-none" />
            <img
              src={heroDonation}
              alt="Main déposant une pièce dans une urne de don bleue"
              className="relative w-full max-w-[520px] h-auto object-contain mix-blend-screen drop-shadow-[0_18px_32px_rgba(0,0,0,0.35)]"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="relative mt-12 rounded-2xl bg-gold-400 text-navy-900 px-5 py-4 md:px-7 flex flex-col md:flex-row md:items-center gap-4"
        >
          <div className="flex items-start gap-3 flex-1">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <Heart className="w-4 h-4 fill-coral-400 text-coral-400" />
            </span>
            <p className="text-sm md:text-base font-semibold leading-snug">
              Chaque don offre nourriture, abri et un soutien communautaire qui change des vies.
            </p>
          </div>
          <Link to="/contact#don" className="shrink-0 inline-flex items-center justify-center rounded-full bg-navy-900 text-white font-bold text-sm px-5 py-2.5 hover:bg-navy-800">
            Faire un don
          </Link>
        </motion.div>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path fill="#E8EEFC" d="M0,48 C240,80 480,8 720,32 C960,56 1200,80 1440,24 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
}
