import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Bot,
  ArrowRight,
  Sparkles,
  Eye,
  HandHeart,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
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
  }, [value]);
  return <>{count.toLocaleString('fr-FR')}{suffix}</>;
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80"
            alt="Solidarité"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-stone-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-medium text-white/90 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Transparence totale, impact mesurable
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight"
            >
              Chaque don mérite{' '}
              <span className="text-brand-400">d'être suivi</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-xl"
            >
              Omnia révolutionne la solidarité en Tunisie : traçabilité complète des fonds,
              scoring intelligent des familles, et planification optimisée des visites.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-900/30 hover:bg-brand-700 hover:scale-[1.03] transition-all duration-300"
              >
                Découvrir l'impact
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/traceability"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/20 hover:scale-[1.03] transition-all duration-300"
              >
                <ShieldCheck className="w-4 h-4" />
                Traçabilité des dons
              </Link>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" />
        </motion.div>
      </section>

      {/* Impact chiffré */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Notre impact</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-stone-900">
                Des chiffres qui parlent
              </h2>
              <p className="mt-4 text-stone-500 leading-relaxed">
                Chaque chiffre représente une vie touchée, une famille aidée, un sourire retrouvé.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Familles accompagnées', value: stats?.totalFamilies ?? 0, icon: Heart, color: 'bg-rose-50 text-rose-600' },
              { label: 'Visites réalisées', value: stats?.totalVisits ?? 0, icon: MapPin, color: 'bg-brand-50 text-brand-600' },
              { label: 'Distributions', value: stats?.totalAidDistributions ?? 0, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Visites actives', value: stats?.activeVisits ?? 0, icon: Sparkles, color: 'bg-amber-50 text-amber-600' },
            ].map((c, i) => (
              <ScrollReveal key={c.label} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl bg-stone-50 p-6 md:p-8 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-200/30 transition-all duration-300 group">
                  <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl md:text-4xl font-display font-bold text-stone-900">
                    <AnimatedCounter value={c.value} />
                  </p>
                  <p className="mt-2 text-sm text-stone-500 font-medium">{c.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling : Comment ça marche */}
      <section className="py-20 md:py-28 bg-[#FFFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Notre méthode</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-stone-900">
                Comment ça marche ?
              </h2>
              <p className="mt-4 text-stone-500 leading-relaxed">
                Un processus transparent et intelligent, de la collecte du don jusqu'à la famille bénéficiaire.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Collecte transparente',
                desc: 'Chaque don est enregistré et tracé dans notre système. Vous savez exactement où va votre argent.',
                img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80',
                icon: Eye,
              },
              {
                step: '02',
                title: 'Évaluation intelligente',
                desc: 'Notre algorithme analyse objectivement les besoins de chaque famille pour prioriser l\'aide.',
                img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
                icon: TrendingUp,
              },
              {
                step: '03',
                title: 'Distribution sur le terrain',
                desc: 'Nos bénévoles livrent l\'aide directement, avec un suivi en temps réel de chaque visite.',
                img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
                icon: HandHeart,
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.15}>
                <div className="group rounded-2xl bg-white border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-500">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                    <span className="absolute top-4 left-4 text-5xl font-display font-bold text-white/20">{item.step}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-stone-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Différenciation */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Ce qui nous distingue</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-stone-900">
                Une approche unique en Tunisie
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Traçabilité complète',
                desc: 'Suivez chaque dinar depuis le don jusqu\'à la famille bénéficiaire, avec historique vérifiable.',
                color: 'bg-brand-50 text-brand-600',
              },
              {
                icon: TrendingUp,
                title: 'Score de vulnérabilité IA',
                desc: 'Un algorithme évalue objectivement les besoins pour prioriser l\'aide là où elle est la plus urgente.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: MapPin,
                title: 'Planification intelligente',
                desc: 'Optimisation des itinéraires de visite basée sur la géolocalisation pour gagner du temps.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Bot,
                title: 'Assistant caritatif',
                desc: 'Un chatbot intelligent répond à vos questions 24/7 sur l\'association, les dons et l\'impact.',
                color: 'bg-rose-50 text-rose-600',
              },
              {
                icon: Heart,
                title: 'Parrainage virtuel',
                desc: 'Soutenez une famille spécifique et recevez des mises à jour sur son parcours.',
                color: 'bg-brand-50 text-brand-600',
              },
              {
                icon: Eye,
                title: 'Tableau de bord public',
                desc: 'Toutes les statistiques d\'impact sont publiques et mises à jour en temps réel.',
                color: 'bg-emerald-50 text-emerald-600',
              },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-2xl bg-stone-50 p-6 border border-stone-100 hover:bg-white hover:shadow-lg hover:shadow-stone-200/20 hover:border-stone-200 transition-all duration-300 group h-full">
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-stone-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 md:py-28 bg-[#FFFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Ils témoignent</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-stone-900">
                Des vies transformées
              </h2>
              <p className="mt-4 text-stone-500 leading-relaxed">
                Derrière chaque chiffre, il y a des histoires humaines. Voici quelques-unes d'entre elles.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Grâce à Omnia, mes enfants ont pu retourner à l'école. Le kit scolaire est arrivé exactement quand on en avait besoin. Je sais d'où vient chaque cahier.",
                name: 'Fatma B.',
                role: 'Mère de famille, Tunis',
                img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
              },
              {
                quote: "En tant que donateur, voir mon colis alimentaire arriver chez la famille Ben Ali avec photo et date de livraison, ça change tout. Je donne les yeux fermés maintenant.",
                name: 'Karim M.',
                role: 'Donateur régulier, Paris',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
              },
              {
                quote: "Le score de vulnérabilité nous aide à prioriser sans favoritisme. En 6 mois de bénévolat, j'ai vu 40 familles accompagnées avec une dignité que je n'avais jamais vue ailleurs.",
                name: 'Sarah T.',
                role: 'Bénévole terrain, Sousse',
                img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
              },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.15}>
                <div className="h-full flex flex-col rounded-2xl bg-white border border-stone-100 p-7 hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-500">
                  <div className="text-brand-300 font-display text-5xl leading-none mb-4">"</div>
                  <p className="text-stone-600 leading-relaxed flex-1 italic">{t.quote}</p>
                  <div className="mt-6 flex items-center gap-3 pt-5 border-t border-stone-100">
                    <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-100" />
                    <div>
                      <p className="font-display font-bold text-stone-900 text-sm">{t.name}</p>
                      <p className="text-xs text-stone-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '95%', label: 'des dons arrivent aux familles' },
                { value: '48h', label: 'délai moyen de réponse' },
                { value: '12', label: 'villes couvertes en Tunisie' },
                { value: '100%', label: 'des distributions tracées' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white border border-stone-100 p-6">
                  <p className="text-4xl md:text-5xl font-display font-bold text-brand-600">{s.value}</p>
                  <p className="mt-2 text-xs md:text-sm text-stone-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
              Rejoignez le mouvement<br />
              <span className="text-brand-400">de la transparence</span>
            </h2>
            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Que vous soyez donateur, bénévole ou simplement curieux, chaque geste compte.
              Ensemble, construisons une solidarité digne de confiance.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-brand-900/40 hover:bg-brand-700 hover:scale-[1.03] transition-all duration-300"
              >
                Voir l'impact en direct
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/chatbot"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-300"
              >
                <Bot className="w-4 h-4" />
                Parler à l'assistant
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
