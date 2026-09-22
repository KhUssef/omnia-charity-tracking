import type { DashboardStats } from '../../types';
import { ScrollReveal } from '../motion';
import { ProgressBar } from '../ui/ProgressBar';
import { PillButton } from '../ui/PillButton';
import { AidTypeMark } from '../decor/Ornaments';

const LABELS: Record<string, { title: string; desc: string }> = {
  FOOD: { title: 'Aide alimentaire', desc: 'Colis, denrées et suivi de proximité.' },
  MEDICINE: { title: 'Santé et soins', desc: 'Médicaments et kits pour les foyers vulnérables.' },
  FINANCIAL: { title: 'Soutien financier', desc: 'Loyer, urgences et aide ponctuelle tracée.' },
  SOCIAL: { title: 'Accompagnement social', desc: 'Visites, scolarité et lien humain.' },
  OTHER: { title: 'Autres causes', desc: 'Interventions adaptées au terrain.' },
};

export function CausesGrid({ stats }: { stats: DashboardStats | null }) {
  const entries = Object.entries(stats?.familiesByAidType || {});
  const fallback = ['FOOD', 'MEDICINE', 'FINANCIAL', 'SOCIAL'].map((type) => [type, 1] as const);
  const rows = (entries.length ? entries : fallback).map(([type, count]) => ({ type, count: Number(count) || 0 }));
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section id="causes" className="section-sky py-16 md:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900">S’engager avec nos causes</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {rows.map((row, i) => {
            const meta = LABELS[row.type] || LABELS.OTHER;
            const progress = Math.round((row.count / max) * 100);
            return (
              <ScrollReveal key={row.type} delay={i * 0.05}>
                <article className="rounded-[1.6rem] overflow-hidden bg-white border border-navy-900/5 shadow-[var(--shadow-soft)] h-full flex flex-col transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <div className="h-36 flex items-center justify-center bg-navy-900">
                    <AidTypeMark type={row.type} className="w-20 h-20" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy-900">{meta.title}</h3>
                      {progress >= 85 && (
                        <span className="shrink-0 rounded-full bg-coral-400 text-white text-[10px] font-bold px-2 py-0.5">
                          Objectif proche
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-navy-700/70 flex-1">{meta.desc}</p>
                    <p className="mt-3 text-[11px] font-mono text-navy-700/60">{row.count} foyers concernés</p>
                    <ProgressBar value={progress} className="mt-2" showLabel />
                    <PillButton to="/contact#don" className="mt-4 !py-2 !px-4 text-sm">
                      Faire un don
                    </PillButton>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
