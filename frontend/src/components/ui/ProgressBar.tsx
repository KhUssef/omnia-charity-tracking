export function ProgressBar({
  value,
  className = '',
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className={className}>
      <div className="h-1.5 rounded-full bg-navy-900/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-coral-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs font-semibold text-navy-800 text-right">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
