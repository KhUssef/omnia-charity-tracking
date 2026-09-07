import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, ShieldCheck, MapPin, Phone, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import type { Family, VulnerabilityScore } from '../types';

function VulnerabilityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    critical: 'bg-rose-100 text-rose-700 border-rose-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    medium: 'bg-brand-100 text-brand-700 border-brand-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const labels: Record<string, string> = {
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Modéré',
    low: 'Faible',
  };
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

  useEffect(() => {
    Promise.all([api.getFamilies(), api.getVulnerabilityScores()])
      .then(([f, s]) => {
        setFamilies(f.data);
        setScores(s);
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false));
  }, []);

  const scoreMap = new Map(scores.map((s) => [s.familyId, s]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Accompagnement</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Familles accompagnées</h1>
        <p className="mt-2 text-stone-500 text-sm">Liste des familles avec leur score de vulnérabilité calculé par notre algorithme.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-stone-100 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {families.map((family, i) => {
            const vs = scoreMap.get(family.id);
            return (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedFamily(family)}
                className="rounded-2xl bg-white p-5 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/20 hover:border-stone-200 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-stone-900">Famille {family.lastName}</p>
                      <p className="text-xs text-stone-400">{family.numberOfMembers} membres</p>
                    </div>
                  </div>
                  {vs ? <VulnerabilityBadge level={vs.level} /> : null}
                </div>
                <div className="space-y-1.5 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {family.address}
                  </div>
                  {family.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {family.phone}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {family.containsDisabledMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-medium border border-rose-100">
                      <ShieldCheck className="w-3 h-3" /> Handicap
                    </span>
                  )}
                  {family.containsElderlyMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-medium border border-amber-100">
                      <UserCheck className="w-3 h-3" /> Personne âgée
                    </span>
                  )}
                  {family.containspupilMember && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-medium border border-brand-100">
                      <Users className="w-3 h-3" /> Scolarisation
                    </span>
                  )}
                </div>
                {vs && (
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-stone-500">Score de vulnérabilité</span>
                      <span className="font-bold text-stone-800">{vs.score}/100</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          vs.level === 'critical' ? 'bg-rose-500' : vs.level === 'high' ? 'bg-amber-500' : vs.level === 'medium' ? 'bg-brand-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${vs.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedFamily(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-display font-bold text-stone-900 mb-1">Famille {selectedFamily.lastName}</h3>
            <p className="text-sm text-stone-500 mb-4">{selectedFamily.numberOfMembers} membres • {selectedFamily.address}</p>
            {selectedFamily.notes && (
              <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600 mb-4 border border-stone-100">{selectedFamily.notes}</div>
            )}
            {scoreMap.get(selectedFamily.id)?.factors && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Facteurs du score</p>
                {scoreMap.get(selectedFamily.id)!.factors.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">{f.label}</span>
                    <span className="font-semibold text-rose-600">+{f.impact}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedFamily(null)}
              className="mt-6 w-full rounded-xl bg-stone-900 text-white py-2.5 text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
