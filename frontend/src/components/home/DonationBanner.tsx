import { PillButton } from '../ui/PillButton';
import { DonationBoxSvg } from '../decor/Ornaments';

export function DonationBanner({
  variant = 'navy',
  title,
  body,
  cta = 'Faire un don',
  to = '/contact#don',
}: {
  variant?: 'navy' | 'gold';
  title: string;
  body: string;
  cta?: string;
  to?: string;
}) {
  const shell =
    variant === 'gold'
      ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900'
      : 'section-navy text-on-navy';

  return (
    <div className={`relative overflow-hidden rounded-[2rem] px-6 py-10 md:px-12 md:py-12 ${shell}`}>
      <div className="pointer-events-none absolute -right-6 -bottom-8 opacity-25">
        <DonationBoxSvg className="w-36 h-36" />
      </div>
      <div className="relative grid md:grid-cols-[1.4fr_auto] gap-6 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h2>
          <p className={`mt-3 max-w-xl ${variant === 'gold' ? 'text-navy-800/80' : 'text-on-navy-muted'}`}>{body}</p>
        </div>
        <PillButton to={to} variant={variant === 'gold' ? 'outline-navy' : 'gold'} className="justify-center">
          {cta}
        </PillButton>
      </div>
    </div>
  );
}
