import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'gold' | 'outline-navy' | 'outline-white';

const VARIANTS: Record<Variant, string> = {
  gold: 'btn-gold',
  'outline-navy': 'btn-outline-navy',
  'outline-white': 'btn-outline-white',
};

export function PillButton({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'gold',
  className = '',
  disabled,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: Variant;
  className?: string;
  disabled?: boolean;
}) {
  const cls = `${VARIANTS[variant]} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${cls} disabled:opacity-60`}>
      {children}
    </button>
  );
}
