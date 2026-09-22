import { LayoutDashboard, GitBranch, Users, MapPin, MessageCircle, Menu, X, LogIn, LogOut, Shield, UserCircle, Settings, HeartHandshake } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from './BrandLogo';
import { OMNIA } from '../data/omnia';
import { PillButton } from './ui/PillButton';

const publicLinks = [
  { to: '/', label: 'Accueil', icon: HeartHandshake },
  { to: '/dashboard', label: 'Impact', icon: LayoutDashboard },
  { to: '/#causes', label: 'Causes', icon: Users },
  { to: '/contact', label: 'Contact', icon: MessageCircle },
];

const protectedLinks = [
  { to: '/traceability', label: 'Traçabilité', icon: GitBranch, roles: ['ADMIN', 'EMPLOYEE', 'USER'] },
  { to: '/families', label: 'Familles', icon: Users, roles: ['ADMIN', 'EMPLOYEE', 'USER'] },
  { to: '/visits', label: 'Visites', icon: MapPin, roles: ['ADMIN', 'EMPLOYEE'] },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const onHome = location.pathname === '/';

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

  const linkClass = (active: boolean) =>
    active ? 'text-white bg-white/15' : 'text-white/80 hover:text-white hover:bg-white/10';

  return (
    <header
      className={
        onHome
          ? 'absolute top-0 left-0 right-0 z-50 border-transparent bg-transparent'
          : 'sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur-xl'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center rounded-full px-2 py-1 bg-white">
            <BrandLogo className="h-8 md:h-9" />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const [path, hash] = link.to.split('#');
              const active = hash
                ? location.pathname === '/' && location.hash === `#${hash}`
                : location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${linkClass(active)}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <PillButton to="/contact#don" className="!py-2 !px-4 text-sm">
              Faire un don
            </PillButton>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profil" className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/15 text-white">
                  <UserCircle className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-medium text-white">{user?.name}</span>
                  {user?.role === 'ADMIN' && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-navy-900 bg-gold-400 px-1.5 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full text-white/80 hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-outline-white !py-2 !px-4 text-sm">
                <LogIn className="w-3.5 h-3.5" />
                Connexion
              </Link>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-white hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)}>
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
            className="md:hidden overflow-hidden border-t border-white/10 bg-navy-900 text-white"
          >
            <div className="px-4 py-3 space-y-1">
              {allLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/contact#don"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-navy-900 bg-gold-400"
              >
                Faire un don
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white"
                >
                  <LogIn className="w-4 h-4" /> Connexion
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
    <footer className="bg-navy-900 text-on-navy-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div>
            <span className="inline-block rounded-full bg-white px-2 py-1 mb-3">
              <BrandLogo className="h-9" />
            </span>
            <p className="text-sm leading-relaxed">
              Association humanitaire tunisienne. Une bouffée d’espoir, une étincelle de lumière.
            </p>
          </div>
          <div className="text-sm space-y-1">
            <p>{OMNIA.address}</p>
            <p>{OMNIA.phone}</p>
            <p>{OMNIA.email}</p>
            <p className="font-mono text-xs">JORT {OMNIA.jort}</p>
          </div>
          <div className="flex md:justify-end gap-5 text-sm">
            <Link to="/contact" className="hover:text-gold-400">Contact</Link>
            <Link to="/#partenaires" className="hover:text-gold-400">Partenaires</Link>
            <Link to="/mentions-legales" className="hover:text-gold-400">Mentions légales</Link>
          </div>
        </div>
        <p className="mt-8 pt-6 border-t border-white/10 text-[11px] text-center">
          © {new Date().getFullYear()} Association Omnia. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
