import { GlassStatCard } from './ui/GlassStatCard';

export function StatCard({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: unknown;
  color?: 'primary' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}) {
  return <GlassStatCard value={value} label={label} suffix={suffix} />;
}
