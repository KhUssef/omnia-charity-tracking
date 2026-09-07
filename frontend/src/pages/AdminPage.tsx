import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Package,
  MapPin,
  Shield,
  LayoutDashboard,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import type { Family, Aid, AidDistribution, Visit, User } from '../types';

const tabs = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'families', label: 'Familles', icon: Users },
  { id: 'aids', label: 'Aides', icon: Package },
  { id: 'visits', label: 'Visites', icon: MapPin },
  { id: 'users', label: 'Utilisateurs', icon: Shield },
];

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-100 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-stone-900">{title}</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DashboardTab() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Familles', value: summary?.totalFamilies ?? 0, icon: Users, color: 'bg-brand-50 text-brand-700 border-brand-100' },
    { label: 'Visites en attente', value: summary?.pendingVisits ?? 0, icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Visites actives', value: summary?.activeVisits ?? 0, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Utilisateurs', value: summary?.totalUsers ?? 0, icon: Shield, color: 'bg-rose-50 text-rose-700 border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">{c.label}</p>
                <p className="mt-2 text-3xl font-display font-bold text-stone-900">{loading ? '—' : c.value}</p>
              </div>
              <div className={`rounded-xl p-2.5 border ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 border border-stone-100">
        <h3 className="font-display font-bold text-stone-800 mb-4">Dernières distributions</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-stone-100 skeleton rounded-lg" />)}
          </div>
        ) : summary?.recentDistributions?.length === 0 ? (
          <p className="text-sm text-stone-400">Aucune distribution récente.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {summary?.recentDistributions?.map((d: AidDistribution) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800">{d.aid?.name || 'Aide'}</p>
                  <p className="text-xs text-stone-400">{d.visit?.family?.lastName ? `Famille ${d.visit.family.lastName}` : '—'} • {d.quantity} unités</p>
                </div>
                <span className="text-xs text-stone-400">{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FamiliesTab() {
  const [data, setData] = useState<{ data: Family[]; total: number; page: number; totalPages: number } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [form, setForm] = useState<Partial<Family>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getFamilies(search, page, 10);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ numberOfMembers: 1, containsDisabledMember: false, containsElderlyMember: false, containspupilMember: false });
    setModalOpen(true);
  };

  const openEdit = (f: Family) => {
    setEditing(f);
    setForm({ ...f });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      if (editing) await api.updateFamily(editing.id, form);
      else await api.createFamily(form);
      setModalOpen(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette famille ?')) return;
    try { await api.deleteFamily(id); load(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full rounded-xl bg-white pl-10 pr-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-shadow"
          />
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors shadow-lg shadow-brand-700/10">
          <Plus className="w-4 h-4" />
          Ajouter une famille
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left font-semibold text-stone-700 px-4 py-3">Nom</th>
                <th className="text-left font-semibold text-stone-700 px-4 py-3">Adresse</th>
                <th className="text-left font-semibold text-stone-700 px-4 py-3">Membres</th>
                <th className="text-left font-semibold text-stone-700 px-4 py-3">Flags</th>
                <th className="text-right font-semibold text-stone-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 bg-stone-100 skeleton rounded" /></td></tr>) :
              data?.data.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">Aucune famille trouvée.</td></tr> :
              data?.data.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{f.lastName}</td>
                  <td className="px-4 py-3 text-stone-500">{f.address}</td>
                  <td className="px-4 py-3 text-stone-500">{f.numberOfMembers}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {f.containsDisabledMember && <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-100">Handicap</span>}
                      {f.containsElderlyMember && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-100">Âgé</span>}
                      {f.containspupilMember && <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full border border-brand-100">Scolaire</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-stone-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            <span className="text-sm text-stone-500">Page {page} / {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 disabled:opacity-40">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la famille' : 'Nouvelle famille'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Nom de famille</label>
            <input value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Adresse</label>
            <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Téléphone</label>
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Membres</label>
              <input type="number" min={1} value={form.numberOfMembers || 1} onChange={(e) => setForm({ ...form, numberOfMembers: parseInt(e.target.value) })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { key: 'containsDisabledMember', label: 'Handicap' },
              { key: 'containsElderlyMember', label: 'Personne âgée' },
              { key: 'containspupilMember', label: 'Scolarisation' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" checked={!!(form as any)[flag.key]} onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })} className="rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
                {flag.label}
              </label>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <button onClick={submit} className="w-full rounded-xl bg-brand-700 text-white py-2.5 text-sm font-semibold hover:bg-brand-800 transition-colors">
            {editing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function AidsTab() {
  const [aids, setAids] = useState<Aid[]>([]);
  const [distributions, setDistributions] = useState<AidDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [aidModal, setAidModal] = useState(false);
  const [distModal, setDistModal] = useState(false);
  const [editingAid, setEditingAid] = useState<Aid | null>(null);
  const [aidForm, setAidForm] = useState<Partial<Aid>>({});
  const [distForm, setDistForm] = useState<Partial<AidDistribution>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([api.getAids(), api.getAidDistributions()]);
      setAids(a);
      setDistributions(d);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitAid = async () => {
    try {
      if (editingAid) await api.updateAid(editingAid.id, aidForm);
      else await api.createAid(aidForm);
      setAidModal(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const submitDist = async () => {
    try {
      await api.createAidDistribution(distForm);
      setDistModal(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const removeAid = async (id: string) => {
    if (!confirm('Supprimer cette aide ?')) return;
    await api.deleteAid(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-stone-800">Aides disponibles</h3>
        <button onClick={() => { setEditingAid(null); setAidForm({}); setAidModal(true); }} className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors shadow-lg shadow-brand-700/10">
          <Plus className="w-4 h-4" /> Nouvelle aide
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Nom</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Type</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Description</th>
              <th className="text-right font-semibold text-stone-700 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-6 bg-stone-100 skeleton rounded" /></td></tr>) :
            aids.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-400">Aucune aide.</td></tr> :
            aids.map((a) => (
              <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-800">{a.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold border border-brand-100">{a.type}</span>
                </td>
                <td className="px-4 py-3 text-stone-500">{a.description || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditingAid(a); setAidForm({ ...a }); setAidModal(true); }} className="p-1.5 rounded-lg text-stone-400 hover:text-brand-600 hover:bg-brand-50"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => removeAid(a.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-stone-800">Distributions</h3>
        <button onClick={() => { setDistForm({}); setDistModal(true); }} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-700/10">
          <Plus className="w-4 h-4" /> Nouvelle distribution
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Aide</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Quantité</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Date</th>
              <th className="text-right font-semibold text-stone-700 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {distributions.map((d) => (
              <tr key={d.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-800">{d.aid?.name || '—'}</td>
                <td className="px-4 py-3 text-stone-500">{d.quantity}</td>
                <td className="px-4 py-3 text-stone-500">{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={async () => { if (confirm('Supprimer ?')) { await api.deleteAidDistribution(d.id); load(); } }} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={aidModal} onClose={() => setAidModal(false)} title={editingAid ? 'Modifier aide' : 'Nouvelle aide'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Nom</label><input value={aidForm.name || ''} onChange={(e) => setAidForm({ ...aidForm, name: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
            <select value={aidForm.type || 'FOOD'} onChange={(e) => setAidForm({ ...aidForm, type: e.target.value as any })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option value="FOOD">Nourriture</option>
              <option value="MEDICINE">Médicaments</option>
              <option value="FINANCIAL">Financier</option>
              <option value="SOCIAL">Social</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Description</label><textarea value={aidForm.description || ''} onChange={(e) => setAidForm({ ...aidForm, description: e.target.value })} rows={3} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <button onClick={submitAid} className="w-full rounded-xl bg-brand-700 text-white py-2.5 text-sm font-semibold hover:bg-brand-800 transition-colors">{editingAid ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </Modal>

      <Modal open={distModal} onClose={() => setDistModal(false)} title="Nouvelle distribution">
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Aide</label>
            <select value={(distForm as any).aidId || ''} onChange={(e) => setDistForm({ ...distForm, aid: { id: e.target.value } as any })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option value="">Choisir...</option>
              {aids.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Quantité</label><input type="number" min={1} value={distForm.quantity || 1} onChange={(e) => setDistForm({ ...distForm, quantity: parseInt(e.target.value) })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <button onClick={submitDist} className="w-full rounded-xl bg-emerald-700 text-white py-2.5 text-sm font-semibold hover:bg-emerald-800 transition-colors">Créer</button>
        </div>
      </Modal>
    </div>
  );
}

function VisitsTab() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Visit | null>(null);
  const [form, setForm] = useState<Partial<Visit>>({});

  const load = async () => {
    setLoading(true);
    try { const v = await api.getVisits(); setVisits(v); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      if (editing) await api.updateVisit(editing.id, form);
      else await api.createVisit(form);
      setModalOpen(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette visite ?')) return;
    await api.deleteVisit(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-stone-800">Visites</h3>
        <button onClick={() => { setEditing(null); setForm({ isActive: false, isCompleted: false }); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors shadow-lg shadow-brand-700/10">
          <Plus className="w-4 h-4" /> Planifier une visite
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Famille</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Date</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Statut</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Notes</th>
              <th className="text-right font-semibold text-stone-700 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 bg-stone-100 skeleton rounded" /></td></tr>) :
            visits.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">Aucune visite.</td></tr> :
            visits.map((v) => (
              <tr key={v.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-800">{v.family?.lastName || '—'}</td>
                <td className="px-4 py-3 text-stone-500">{new Date(v.startDate).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  {v.isCompleted ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Terminée</span> :
                   v.isActive ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold border border-brand-200"><Clock className="w-3 h-3" /> En cours</span> :
                   <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-600 px-2 py-0.5 text-[10px] font-semibold border border-stone-200">Planifiée</span>}
                </td>
                <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{v.notes || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(v); setForm({ ...v }); setModalOpen(true); }} className="p-1.5 rounded-lg text-stone-400 hover:text-brand-600 hover:bg-brand-50"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier visite' : 'Nouvelle visite'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Date de début</label><input type="datetime-local" value={(form.startDate || '').slice(0, 16)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Date de fin</label><input type="datetime-local" value={(form.endDate || '').slice(0, 16)} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-stone-300 text-brand-600 focus:ring-brand-500" /> En cours</label>
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={!!form.isCompleted} onChange={(e) => setForm({ ...form, isCompleted: e.target.checked })} className="rounded border-stone-300 text-brand-600 focus:ring-brand-500" /> Terminée</label>
          </div>
          <div><label className="block text-xs font-medium text-stone-600 mb-1">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl bg-stone-50 px-3 py-2 text-sm border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          <button onClick={submit} className="w-full rounded-xl bg-brand-700 text-white py-2.5 text-sm font-semibold hover:bg-brand-800 transition-colors">{editing ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </Modal>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const u = await api.getUsers(); setUsers(u); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, role: string) => {
    try { await api.updateUser(id, { role } as any); load(); } catch (e: any) { alert(e.message); }
  };

  const toggleActive = async (u: User) => {
    try { await api.updateUser(u.id, { isActive: !u.isActive } as any); load(); } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await api.deleteUser(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Nom</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Email</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Rôle</th>
              <th className="text-left font-semibold text-stone-700 px-4 py-3">Statut</th>
              <th className="text-right font-semibold text-stone-700 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 bg-stone-100 skeleton rounded" /></td></tr>) :
            users.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">Aucun utilisateur.</td></tr> :
            users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-medium text-stone-800">{u.name}</td>
                <td className="px-4 py-3 text-stone-500">{u.email}</td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="rounded-lg bg-stone-50 text-xs font-medium text-stone-700 px-2 py-1 border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                    <option value="USER">User</option>
                    <option value="WORKER">Worker</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-colors ${u.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {u.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {u.isActive !== false ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(u.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Administration</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Espace Administration</h1>
        <p className="mt-2 text-stone-500 text-sm">Gestion complète de l'association.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-64 shrink-0">
          <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active ? 'text-brand-800 bg-brand-50' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'families' && <FamiliesTab />}
              {activeTab === 'aids' && <AidsTab />}
              {activeTab === 'visits' && <VisitsTab />}
              {activeTab === 'users' && <UsersTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
