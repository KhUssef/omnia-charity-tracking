import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function ProfilePage() {
  const { user } = useAuth();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const roleLabels: Record<string, string> = { ADMIN: 'Administrateur', EMPLOYEE: 'Bénévole', USER: 'Utilisateur' };
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-brand-100 text-brand-800 border-brand-200',
    EMPLOYEE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    USER: 'bg-stone-100 text-stone-800 border-stone-200',
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPw || !newPw || !confirmPw) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (newPw.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(oldPw, newPw);
      setSuccess('Mot de passe modifié avec succès !');
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors du changement de mot de passe.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center">
        <p className="text-stone-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-stone-900 mb-4">Mon Profil</h1>
          <p className="text-stone-600 mb-12">Consultez vos informations et gérez votre compte.</p>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-2xl font-display font-bold text-stone-900 mb-6 flex items-center gap-2"><User className="w-6 h-6 text-brand-600" />Informations personnelles</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                <User className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <div><p className="text-xs text-stone-500 uppercase tracking-wide">Nom</p><p className="font-medium text-stone-900">{user.name}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                <Mail className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <div><p className="text-xs text-stone-500 uppercase tracking-wide">Email</p><p className="font-medium text-stone-900">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                <Shield className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Rôle</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${roleColors[user.role] || roleColors.USER}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-2xl font-display font-bold text-stone-900 mb-6 flex items-center gap-2"><Lock className="w-6 h-6 text-brand-600" />Changer le mot de passe</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Ancien mot de passe</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">{showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">{showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" placeholder="••••••••" />
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              {success && <p className="text-emerald-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" />{success}</p>}
              <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition">
                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
