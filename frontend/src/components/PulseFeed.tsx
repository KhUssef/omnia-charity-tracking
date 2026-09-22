import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import type { AidDistribution } from '../types';

function formatItem(dist: AidDistribution) {
  const family = dist.visit?.families?.[0]?.lastName;
  const aid = dist.aid?.name || 'Aide';
  const qty = dist.quantity ? `${dist.quantity} ${dist.unit || ''}`.trim() : '';
  return {
    id: dist.id,
    text: family ? `${aid} → famille ${family}` : aid,
    meta: qty,
    time: dist.createdAt || dist.date,
  };
}

export function PulseFeed({
  items,
  title = 'Activité récente',
}: {
  items: AidDistribution[];
  title?: string;
}) {
  const rows = items.slice(0, 8).map(formatItem);
  if (rows.length === 0) return null;

  return (
    <div className="rounded-[1.75rem] bg-white border border-navy-900/8 overflow-hidden shadow-[var(--shadow-soft)]">
      <div className="px-5 py-4 flex items-center gap-2 border-b border-navy-900/8 bg-navy-900">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-60 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral-400" />
        </span>
        <Radio className="w-4 h-4 text-gold-400" />
        <p className="eyebrow text-gold-400">{title}</p>
      </div>
      <div className="divide-y divide-sky-100">
        {rows.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-5 py-3.5 flex items-center justify-between gap-4"
          >
            <p className="text-sm text-navy-800 truncate">{row.text}</p>
            <div className="shrink-0 text-right">
              {row.meta && <p className="font-mono text-[11px] text-gold-600">{row.meta}</p>}
              {row.time && (
                <p className="text-[10px] text-navy-700/50">{new Date(row.time).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
