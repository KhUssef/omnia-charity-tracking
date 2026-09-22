import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GlobePins, Leaf } from '../decor/Ornaments';
import { PillButton } from '../ui/PillButton';

const MISSIONS = [
  {
    title: 'Éducation et formation',
    body: 'Kits scolaires, tutorat et suivi des enfants pour qu’aucun foyer ne sacrifie la scolarité.',
  },
  {
    title: 'Aide alimentaire et logement',
    body: 'Colis, loyer et visites de proximité — chaque distribution est enregistrée jusqu’à la famille.',
  },
  {
    title: 'Santé et mobilité',
    body: 'Soutien aux personnes âgées et à mobilité réduite, avec des aides adaptées au terrain.',
  },
  {
    title: 'Un avenir plus clair',
    body: 'Parrainage, traçabilité et bénévolat : une étincelle de lumière, maintenue dans la durée.',
  },
];

export function MissionPanel() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section-sky pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] section-navy">
          <Leaf className="absolute -left-4 bottom-0 w-28 h-28 text-gold-400 pointer-events-none" />
          <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-navy">La mission de l’organisation</h2>
              <p className="mt-3 text-on-navy-muted">
                Des programmes concrets pour un impact durable dans les communautés que nous accompagnons.
              </p>
              <div className="mt-6 space-y-2">
                {MISSIONS.map((m, i) => (
                  <button
                    key={m.title}
                    type="button"
                    onClick={() => setOpen(i)}
                    className={`w-full text-left rounded-xl px-4 py-3 transition ${
                      open === i ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-on-navy">
                      <span className="font-semibold">{m.title}</span>
                      <ChevronDown className={`w-4 h-4 text-gold-400 transition ${open === i ? 'rotate-180' : ''}`} />
                    </div>
                    {open === i && <p className="mt-2 text-sm text-on-navy-muted leading-relaxed">{m.body}</p>}
                  </button>
                ))}
              </div>
              <PillButton to="/contact#rejoindre" className="mt-6">
                Nous rejoindre
              </PillButton>
            </div>
            <div className="relative min-h-[260px] flex items-center justify-center">
              <GlobePins className="w-72 h-72" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
