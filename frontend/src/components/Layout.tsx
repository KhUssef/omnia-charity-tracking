import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  LayoutDashboard,
  GitBranch,
  Users,
  MapPin,
  MessageCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  Shield,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const publicLinks = [
  { to: '/', label: 'Accueil', icon: Heart },
  { to: '/dashboard', label: 'Impact', icon: LayoutDashboard },
  { to: '/chatbot', label: 'Assistant', icon: MessageCircle },
];

const protectedLinks = [
  { to: '/traceability', label: 'Traçabilité', icon: GitBranch, roles: ['ADMIN', 'WORKER', 'USER'] },
  { to: '/families', label: 'Familles', icon: Users, roles: ['ADMIN', 'WORKER', 'USER'] },
  { to: '/visits', label: 'Visites', icon: MapPin, roles: ['ADMIN', 'WORKER'] },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allLinks = [
    ...publicLinks,
    ...(isAuthenticated
      ? protectedLinks.filter((l) => !l.roles || l.roles.includes(user?.role || ''))
      : []),
    ...(hasRole(['ADMIN']) ? [{ to: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-700/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl text-stone-900 tracking-tight">
              Omnia
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-brand-800 bg-brand-50'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1.5 border border-stone-200/50">
                  <UserCircle className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-medium text-stone-700">{user?.name}</span>
                  {user?.role === 'ADMIN' && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-5 py-2 text-sm font-medium text-white hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-700/20 transition-all duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                Connexion
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-200/50 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {allLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'text-brand-800 bg-brand-50'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-800 bg-brand-50"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-stone-200/50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white">
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-stone-900">Omnia</span>
              <p className="text-[10px] text-stone-400 -mt-0.5">Association caritative</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            Transparence totale, impact mesurable.<br className="md:hidden" /> Chaque don mérite d'être suivi.
          </p>
          <div className="flex items-center gap-5 text-xs text-stone-400">
            <span className="hover:text-stone-600 cursor-pointer transition-colors">Confidentialité</span>
            <span className="hover:text-stone-600 cursor-pointer transition-colors">Contact</span>
            <span className="hover:text-stone-600 cursor-pointer transition-colors">Mentions légales</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-[10px] text-stone-300">
            © {new Date().getFullYear()} Omnia Association. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF7]">
      <Navbar />
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
