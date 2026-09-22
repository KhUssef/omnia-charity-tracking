import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { api } from '../services/api';
import { GlassStatCard } from '../components/ui/GlassStatCard';
import { PageHeader } from '../components/PageHeader';
import { PulseFeed } from '../components/PulseFeed';
import { ScrollReveal } from '../components/motion';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { DashboardStats } from '../types';

const PIE_COLORS = ['#F5C242', '#FF7A59', '#223A5E', '#2A466C', '#E8A93A'];
const AID_LABELS: Record<string, string> = {
  FOOD: 'Nourriture', MEDICINE: 'Médicaments', FINANCIAL: 'Financier', SOCIAL: 'Social', OTHER: 'Autre',
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pieData = stats
    ? Object.entries(stats.familiesByAidType || {}).map(([type, count]) => ({
        name: AID_LABELS[type] || type,
        value: count as number,
      }))
    : [];
  const lineData = stats?.monthlyVisits || [];
  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="section-sky min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <PageHeader
          eyebrow="Transparence"
          title="Notre impact"
          description="Un tableau de bord vivant : familles, visites, distributions — tout est public."
        />

        <div className="rounded-[2rem] section-navy p-5 md:p-8 mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassStatCard label="Familles accompagnées" value={stats?.totalFamilies ?? 0} />
          <GlassStatCard label="Visites réalisées" value={stats?.totalVisits ?? 0} />
          <GlassStatCard label="Distributions" value={stats?.totalAidDistributions ?? 0} />
          <GlassStatCard label="Visites actives" value={stats?.activeVisits ?? 0} />
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          <ScrollReveal className="lg:col-span-3 surface-card rounded-[1.6rem] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-navy-900">Visites par mois</h2>
              <span className="text-xs text-navy-700/60">6 derniers mois</span>
            </div>
            {loading ? <div className="h-64 skeleton" /> : lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e2fa" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4b5d75' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5d75' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#e8eefc' }} contentStyle={{ borderRadius: 16, border: '1px solid #d6e2fa' }} />
                  <Bar dataKey="count" fill="#F5C242" radius={[10, 10, 0, 0]} name="Visites" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-navy-700/50">Aucune donnée</div>
            )}
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-2 surface-card rounded-[1.6rem] p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-1">Répartition des aides</h2>
            <p className="text-xs text-navy-700/60 mb-3">Volume distribué</p>
            {loading ? <div className="h-64 skeleton" /> : pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center -mt-4 mb-4 text-xl font-bold text-navy-900">{pieTotal.toLocaleString('fr-FR')}</p>
                <div className="space-y-2">
                  {pieData.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-navy-700">{d.name}</span>
                        <span className="font-mono text-navy-900">{d.value}</span>
                      </div>
                      <ProgressBar value={pieTotal ? (d.value / pieTotal) * 100 : 0} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-navy-700/50">Aucune donnée</div>
            )}
          </ScrollReveal>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-5">
          <ScrollReveal className="surface-card rounded-[1.6rem] p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-5">Tendance</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e2fa" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4b5d75' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5d75' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #d6e2fa' }} />
                  <Line type="monotone" dataKey="count" stroke="#FF7A59" strokeWidth={3} dot={{ r: 4, fill: '#FF7A59' }} name="Visites" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-navy-700/50 text-sm">Aucune donnée</p>
            )}
          </ScrollReveal>
          <PulseFeed items={stats?.recentDistributions ?? []} title="Dernières distributions" />
        </div>
      </div>
    </div>
  );
}
