import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ChevronRight, Package, MapPin, Users, Calendar } from 'lucide-react';
import { api } from '../services/api';
import type { TraceabilityNode } from '../types';

function TreeNode({ node, depth = 0 }: { node: TraceabilityNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const icons = {
    aid: Package,
    distribution: GitBranch,
    visit: MapPin,
    family: Users,
  };
  const colors = {
    aid: 'bg-brand-100 text-brand-700 border-brand-200',
    distribution: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    visit: 'bg-amber-100 text-amber-700 border-amber-200',
    family: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const Icon = icons[node.type] || Package;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer ${depth > 0 ? 'ml-6 border-l-2 border-stone-100 pl-5' : ''}`}
        onClick={() => node.children?.length && setOpen(!open)}
      >
        {node.children?.length ? (
          <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-4" />
        )}
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colors[node.type]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{node.name}</p>
          {node.details && <p className="text-xs text-stone-400 truncate">{node.details}</p>}
          {node.date && (
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(node.date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
      <AnimatePresence>
        {open && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TraceabilityPage() {
  const [trees, setTrees] = useState<TraceabilityNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTraceability()
      .then(setTrees)
      .catch(() => setError('Impossible de charger la traçabilité.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Transparence</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Traçabilité des fonds</h1>
        <p className="mt-2 text-stone-500 text-sm max-w-2xl">
          Chaque aide est tracée depuis son origine jusqu'à la famille bénéficiaire. Cliquez pour explorer.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-stone-100 skeleton" />
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center border border-stone-100">
          <GitBranch className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Aucune donnée de traçabilité disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trees.map((tree) => (
            <motion.div
              key={tree.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-4 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/20 transition-shadow"
            >
              <TreeNode node={tree} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
