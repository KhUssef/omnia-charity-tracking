import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Heart } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
      const res = await api.login(email, password);
      login(res.access_token, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/30 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-brand-700/20">
              <Heart className="w-7 h-7" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-display font-bold text-stone-900">Connexion</h1>
            <p className="mt-2 text-sm text-stone-500">Accédez à votre espace Omnia</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl bg-stone-50 pl-10 pr-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-stone-50 pl-10 pr-10 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-800 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              Pas encore de compte ? Contactez un administrateur.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
