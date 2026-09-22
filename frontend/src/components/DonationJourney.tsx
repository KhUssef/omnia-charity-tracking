import { motion } from 'framer-motion';
import { HeartHandshake, Landmark, Package, Users } from 'lucide-react';

const STEPS = [
  { label: 'Donateur', detail: 'Don enregistré', icon: HeartHandshake },
  { label: 'Fonds', detail: 'Aide provisionnée', icon: Landmark },
  { label: 'Famille', detail: 'Priorité calculée', icon: Users },
  { label: 'Distribution', detail: 'Livraison tracée', icon: Package },
];

export function DonationJourney({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'rounded-[1.6rem] bg-navy-900 p-5' : 'rounded-[2rem] bg-navy-900 p-6 md:p-10 shadow-[var(--shadow-lift)]'}>
      {!compact && (
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow text-gold-400">Traçabilité</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-on-navy">Le parcours d’un don</h2>
          <p className="mt-3 text-on-navy-muted">Chaque dinar est suivi : du donateur jusqu’à la famille.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5 glass-panel"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400">0{i + 1}</span>
                <div className="w-10 h-10 rounded-xl bg-gold-400 text-navy-900 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-lg font-bold text-on-navy">{step.label}</p>
              <p className="mt-1 text-sm text-on-navy-muted">{step.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
