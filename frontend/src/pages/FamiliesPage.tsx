import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, ShieldCheck, MapPin, Phone, UserCheck, Search } from 'lucide-react';
import { api } from '../services/api';
import type { Family, VulnerabilityScore } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';

function VulnerabilityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    critical: 'bg-coral-400/15 text-coral-600 border-coral-400/40',
    high: 'bg-gold-400/20 text-navy-800 border-gold-400/50',
    medium: 'bg-sky-100 text-navy-800 border-sky-200',
    low: 'bg-white text-navy-700 border-navy-900/10',
  };
  const labels: Record<string, string> = { critical: 'Critique', high: 'Élevé', medium: 'Modéré', low: 'Faible' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${map[level] || map.medium}`}>
      <AlertTriangle className="w-3 h-3" />
      {labels[level] || level}
    </span>
  );
}

export function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [scores, setScores] = useState<VulnerabilityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    Promise.all([api.getFamilies('', 1, 50), api.getVulnerabilityScores()])
      .then(([f, s]) => {
        setFamilies(f.data);
        setScores(s);
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false));
  }, []);

  const scoreMap = new Map(scores.map((s) => [s.familyId, s]));
  const filtered = useMemo(() => {
    return families
      .filter((family) => {
        const vs = scoreMap.get(family.id);
        const matchesQuery = !query || `${family.lastName} ${family.address} ${family.phone || ''}`.toLowerCase().includes(query.toLowerCase());
        const matchesLevel = level === 'all' || vs?.level === level;
        return matchesQuery && matchesLevel;
      })
      .sort((a, b) => (scoreMap.get(b.id)?.score || 0) - (scoreMap.get(a.id)?.score || 0));
  }, [families, query, level, scores]);

  return (
    <div className="section-sky min-h-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <PageHeader
        eyebrow="Accompagnement"
        title="Familles"
        description="Classement par score de vulnérabilité — handicap, aînés, scolarité, taille du foyer."
      />

      <div className="mb-8 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une famille, une ville, un téléphone..."
            className="w-full rounded-2xl bg-white/80 pl-10 pr-4 py-3 text-sm border border-ink-200/70 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setLevel(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                level === id ? 'bg-navy-900 text-gold-400 border-navy-900' : 'bg-white text-navy-800 border-navy-900/10'
              }`}
            >
              {id === 'all' ? 'Tous' : id === 'critical' ? 'Critique' : id === 'high' ? 'Élevé' : id === 'medium' ? 'Modéré' : 'Faible'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((family, i) => {
            const vs = scoreMap.get(family.id);
            return (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedFamily(family)}
                className="rounded-[1.6rem] surface-card p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-ink-900">Famille {family.lastName}</p>
                      <p className="text-xs font-mono text-ink-400">{family.numberOfMembers} membres</p>
                    </div>
                  </div>
                  {vs ? <VulnerabilityBadge level={vs.level} /> : null}
                </div>
                <div className="space-y-1.5 text-xs text-ink-500">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{family.address}</div>
                  {family.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{family.phone}</div>}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {family.containsDisabledMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-medium border border-rose-100">
                      <ShieldCheck className="w-3 h-3" /> Handicap
                    </span>
                  )}
                  {family.containsElderlyMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 text-brand-800 px-2 py-0.5 text-[10px] font-medium border border-brand-100">
                      <UserCheck className="w-3 h-3" /> Personne âgée
                    </span>
                  )}
                  {family.containspupilMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 text-accent-700 px-2 py-0.5 text-[10px] font-medium border border-accent-100">
                      <Users className="w-3 h-3" /> Scolarisation
                    </span>
                  )}
                </div>
                {vs && (
                    <div className="mt-4 pt-3 border-t border-navy-900/10">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-navy-700/70">Score de vulnérabilité</span>
                      <span className="font-mono font-bold text-navy-900">{vs.score}/100</span>
                    </div>
                    <ProgressBar value={vs.score} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setSelectedFamily(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="surface-card rounded-3xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-display font-bold text-ink-900 mb-1">Famille {selectedFamily.lastName}</h3>
            <p className="text-sm text-ink-500 mb-4">{selectedFamily.numberOfMembers} membres • {selectedFamily.address}</p>
            {selectedFamily.notes && <div className="rounded-2xl bg-ink-50 p-3 text-sm text-ink-600 mb-4">{selectedFamily.notes}</div>}
            {scoreMap.get(selectedFamily.id)?.factors && (
              <div className="space-y-2">
                <p className="eyebrow">Facteurs du score</p>
                {scoreMap.get(selectedFamily.id)!.factors.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">{f.label}</span>
                    <span className="font-mono font-semibold text-rose-600">+{f.impact}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setSelectedFamily(null)} className="mt-6 w-full btn-primary justify-center">
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
    </div>
  );
}
