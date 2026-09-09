import { useEffect, useState, useRef } from 'react';

export function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
  color = 'primary',
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  color?: 'primary' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [started, value, delay]);

  const colorMap = {
    primary: 'bg-brand-50 text-brand-700 ring-brand-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {count.toLocaleString('fr-FR')}
            {suffix}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
