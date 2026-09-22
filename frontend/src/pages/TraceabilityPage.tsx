import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ChevronRight, Package, MapPin, Users, Calendar, Landmark } from 'lucide-react';
import { api } from '../services/api';
import type { TraceabilityNode } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DonationJourney } from '../components/DonationJourney';

function TreeNode({ node, depth = 0 }: { node: TraceabilityNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const icons = { aid: Package, distribution: GitBranch, visit: MapPin, family: Users };
  const colors = {
    aid: 'bg-navy-900 text-gold-400 border-navy-800',
    distribution: 'bg-gold-400/15 text-gold-700 border-gold-400/40',
    visit: 'bg-sky-100 text-navy-800 border-sky-200',
    family: 'bg-coral-400/15 text-coral-600 border-coral-400/40',
  };
  const Icon = icons[node.type] || Package;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-sky-50 transition-colors cursor-pointer ${depth > 0 ? 'ml-5 border-l-2 border-gold-400/50 pl-5' : ''}`}
        onClick={() => node.children?.length && setOpen(!open)}
      >
        {node.children?.length ? (
          <ChevronRight className={`w-4 h-4 text-ink-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-4" />
        )}
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${colors[node.type]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-800 truncate">{node.name}</p>
          {node.details && <p className="text-xs text-ink-400 truncate">{node.details}</p>}
          {node.date && (
            <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(node.date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
      <AnimatePresence>
        {open && node.children && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function flattenChain(node: TraceabilityNode): TraceabilityNode[] {
  const chain = [node];
  let current = node;
  while (current.children?.[0]) {
    current = current.children[0];
    chain.push(current);
  }
  return chain;
}

export function TraceabilityPage() {
  const [trees, setTrees] = useState<TraceabilityNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TraceabilityNode | null>(null);

  useEffect(() => {
    api.getTraceability()
      .then((data) => {
        setTrees(data);
        setSelected(data[0] ?? null);
      })
      .catch(() => setError('Impossible de charger la traçabilité.'))
      .finally(() => setLoading(false));
  }, []);

  const chain = selected ? flattenChain(selected) : [];

  return (
    <div className="section-sky min-h-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <PageHeader
        eyebrow="Transparence"
        title="Traçabilité des fonds"
        description="De l’aide à la famille : une chaîne vérifiable, pas une boîte noire."
      />

      <div className="mb-10">
        <DonationJourney compact />
      </div>

      {error && <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">{error}</div>}

      {selected && chain.length > 0 && (
        <div className="mb-10 rounded-[1.8rem] section-navy p-6 md:p-8 overflow-x-auto">
          <p className="eyebrow mb-6 text-gold-400">Chaîne sélectionnée</p>
          <div className="flex items-center gap-3 min-w-max">
            {chain.map((node, i) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className="rounded-2xl glass-panel px-4 py-3 min-w-[9rem]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gold-400">{node.type}</p>
                  <p className="mt-1 text-sm font-medium text-on-navy truncate max-w-[12rem]">{node.name}</p>
                </div>
                {i < chain.length - 1 && <div className="w-8 h-px bg-gold-400/50" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 skeleton" />)}</div>
      ) : trees.length === 0 ? (
        <div className="rounded-3xl surface-card p-8 text-center">
          <GitBranch className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">Aucune donnée de traçabilité disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trees.map((tree) => (
            <motion.button
              key={tree.id}
              type="button"
              onClick={() => setSelected(tree)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-left rounded-[1.6rem] p-4 surface-card ${selected?.id === tree.id ? 'ring-2 ring-gold-400' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2 px-2">
                <Landmark className="w-4 h-4 text-gold-600" />
                <span className="text-xs font-mono uppercase tracking-widest text-ink-400">Aide</span>
              </div>
              <TreeNode node={tree} />
            </motion.button>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
