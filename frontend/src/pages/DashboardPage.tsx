import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import type { DashboardStats } from '../types';

const PIE_COLORS = ['#d97706', '#059669', '#e11d48', '#6366f1', '#0891b2'];
const AID_LABELS: Record<string, string> = {
  FOOD: 'Nourriture', MEDICINE: 'Médicaments', FINANCIAL: 'Financier', SOCIAL: 'Social', OTHER: 'Autre',
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? Object.entries(stats.familiesByAidType).map(([type, count]) => ({
    name: AID_LABELS[type] || type,
    value: count as number,
  })) : [];

  const lineData = stats?.monthlyVisits || [];

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-stone-900 mb-2">Notre Impact</h1>
          <p className="text-lg text-stone-500 mb-10">Transparence totale sur nos actions et résultats.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard label="Familles accompagnées" value={stats?.totalFamilies ?? 0} icon={Heart} color="rose" delay={0} />
          <StatCard label="Visites réalisées" value={stats?.totalVisits ?? 0} icon={MapPin} color="primary" delay={0.1} />
          <StatCard label="Distributions" value={stats?.totalAidDistributions ?? 0} icon={TrendingUp} color="emerald" delay={0.2} />
          <StatCard label="Visites actives" value={stats?.activeVisits ?? 0} icon={Activity} color="amber" delay={0.3} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-display font-bold text-stone-900 mb-6">Évolution des visites</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-stone-400">Chargement...</div>
            ) : lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4' }} />
                  <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={3} dot={{ r: 5, fill: '#d97706' }} name="Visites" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-stone-400">Aucune donnée disponible</div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-display font-bold text-stone-900 mb-6">Répartition par type d'aide</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-stone-400">Chargement...</div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-stone-400">Aucune donnée disponible</div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
