import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { DEMO_ACCOUNTS } from '../data/omnia';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      const token = res.access_token || res.accessToken || '';
      if (!token) throw new Error('Réponse de connexion invalide.');
      login(token, res.user);
      navigate('/');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const friendly =
        /invalid credentials|unauthorized|401/i.test(raw)
          ? 'Email ou mot de passe incorrect.'
          : raw || 'Email ou mot de passe incorrect.';
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden section-navy p-12 items-end">
        <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_80%_0%,rgba(245,194,66,0.22),transparent_55%)]" />
        <div className="relative z-10 text-on-navy max-w-md">
          <p className="text-gold-400 font-semibold text-sm tracking-wide uppercase">Espace membre</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-on-navy">Suivez chaque don jusqu’à la famille.</h2>
          <p className="mt-4 text-on-navy-muted">Administration, bénévoles et donateurs — un même fil de confiance.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 bg-[var(--canvas)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="surface-card rounded-[2rem] p-8">
            <div className="text-center mb-8">
              <BrandLogo className="h-12 mx-auto mb-5" />
              <h1 className="text-2xl font-bold text-ink-900">Connexion</h1>
              <p className="mt-2 text-sm text-ink-500">Accédez à votre espace Omnia</p>
            </div>
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-heart-50 text-heart-700 px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-2xl bg-ink-50 pl-10 pr-4 py-3 text-sm border border-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-ink-50 pl-10 pr-10 py-3 text-sm border border-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-gold justify-center disabled:opacity-60">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Se connecter
                  </>
                )}
              </button>
            </form>
            <div className="mt-6 pt-5 border-t border-ink-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Comptes de démonstration</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setError('');
                    }}
                    className="w-full text-left rounded-xl border border-ink-100 px-3 py-2 hover:bg-ink-50"
                  >
                    <p className="text-xs font-bold text-ink-800">{acc.role}</p>
                    <p className="text-[11px] font-mono text-ink-500">
                      {acc.email} · {acc.password}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
