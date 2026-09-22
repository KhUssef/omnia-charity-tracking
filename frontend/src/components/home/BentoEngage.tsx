import { useState } from 'react';
import { ChevronLeft, ChevronRight, HandHeart, Handshake, Wallet } from 'lucide-react';
import { ScrollReveal } from '../motion';

const ITEMS = [
  { icon: Wallet, title: 'Contribution financière', desc: 'Un don tracé, du dinar jusqu’à la famille.' },
  { icon: HandHeart, title: 'Bénévolat', desc: 'Mentorat, collecte, visites : offrez du temps.' },
  { icon: Handshake, title: 'Partenariats', desc: 'Entreprises et associations, un impact partagé.' },
];

export function BentoEngage() {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i + ITEMS.length - 1) % ITEMS.length);
  const next = () => setIndex((i) => (i + 1) % ITEMS.length);

  return (
    <section className="section-sky py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Comment soutenir la cause ?</h2>
          <div className="flex gap-2 md:hidden">
            <button type="button" onClick={prev} className="h-10 w-10 rounded-full border border-navy-800/20 text-navy-800 bg-white" aria-label="Précédent">
              <ChevronLeft className="w-5 h-5 mx-auto" />
            </button>
            <button type="button" onClick={next} className="h-10 w-10 rounded-full border border-navy-800/20 text-navy-800 bg-white" aria-label="Suivant">
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>
        <div className="md:hidden">
          <Card item={ITEMS[index]} featured />
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {ITEMS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.06}>
              <Card item={item} featured={i === 0} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  item,
  featured,
}: {
  item: (typeof ITEMS)[number];
  featured?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-white p-6 h-full shadow-[var(--shadow-soft)] border transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
      featured ? 'border-gold-400/60' : 'border-navy-900/5'
    }`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-navy-900">
        <item.icon className="w-5 h-5" />
      </span>
      <h3 className="mt-4 font-bold text-navy-900">{item.title}</h3>
      <p className="mt-2 text-sm text-navy-700/70 leading-relaxed">{item.desc}</p>
    </div>
  );
}
