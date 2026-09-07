import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  TrendingUp,
  Activity,
  Calendar,
  Package,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <ScrollReveal>
        <div className="mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Tableau public</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Impact en temps réel</h1>
          <p className="mt-2 text-stone-500 text-sm">Toutes les données sont mises à jour automatiquement et accessibles à tous.</p>
        </div>
      </ScrollReveal>

      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-stone-100 skeleton" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              { label: 'Familles accompagnées', value: stats.totalFamilies, icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-100' },
              { label: 'Visites réalisées', value: stats.totalVisits, icon: MapPin, color: 'bg-brand-50 text-brand-600 border-brand-100' },
              { label: 'Distributions', value: stats.totalAidDistributions, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { label: 'Visites actives', value: stats.activeVisits, icon: Activity, color: 'bg-amber-50 text-amber-600 border-amber-100' },
            ].map((c, i) => (
              <ScrollReveal key={c.label} delay={i * 0.08}>
                <div className="rounded-2xl bg-white p-6 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/20 hover:border-stone-200 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-500">{c.label}</p>
                      <p className="mt-3 text-3xl font-display font-bold text-stone-900">
                        {c.value.toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className={`rounded-xl p-2.5 border ${c.color}`}>
                      <c.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl bg-white p-6 border border-stone-100">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <h3 className="font-display font-bold text-lg text-stone-900">Visites mensuelles</h3>
                </div>
                {stats.monthlyVisits.length === 0 ? (
                  <p className="text-sm text-stone-400">Aucune donnée disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.monthlyVisits.map((m) => {
                      const max = Math.max(...stats.monthlyVisits.map((x) => x.count), 1);
                      const pct = (m.count / max) * 100;
                      return (
                        <div key={m.month} className="flex items-center gap-3">
                          <span className="w-12 text-xs text-stone-500 font-medium shrink-0">{m.month}</span>
                          <div className="flex-1 h-7 bg-stone-100 rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-brand-500 rounded-lg"
                            />
                          </div>
                          <span className="w-8 text-xs text-stone-700 font-semibold text-right">{m.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl bg-white p-6 border border-stone-100">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-display font-bold text-lg text-stone-900">Répartition par type d'aide</h3>
                </div>
                {Object.keys(stats.familiesByAidType).length === 0 ? (
                  <p className="text-sm text-stone-400">Aucune donnée disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.familiesByAidType).map(([type, count]) => {
                      const max = Math.max(...Object.values(stats.familiesByAidType), 1);
                      const pct = (count / max) * 100;
                      const labels: Record<string, string> = {
                        FOOD: 'Nourriture',
                        MEDICINE: 'Médicaments',
                        FINANCIAL: 'Aide financière',
                        SOCIAL: 'Aide sociale',
                        OTHER: 'Autre',
                      };
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="w-28 text-xs text-stone-500 font-medium shrink-0">{labels[type] || type}</span>
                          <div className="flex-1 h-7 bg-stone-100 rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-emerald-500 rounded-lg"
                            />
                          </div>
                          <span className="w-8 text-xs text-stone-700 font-semibold text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </>
      ) : null}
    </div>
  );
}
