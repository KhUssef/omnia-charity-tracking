import { AnimatedCounter } from '../motion';

export function GlassStatCard({
  value,
  label,
  suffix = '',
  className = '',
}: {
  value: number;
  label: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={`glass-panel rounded-2xl px-4 py-3.5 min-w-[8.5rem] max-w-[11.5rem] ${className}`}>
      <p className="text-2xl md:text-3xl font-bold text-on-navy tracking-tight">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs text-on-navy-muted leading-snug">{label}</p>
    </div>
  );
}
