import type { SVGProps } from 'react';

export function Sparkle({ className = 'w-8 h-8 text-gold-400', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className={className} {...props}>
      <path d="M16 1.5c.4 4.8 2.4 9.2 6.2 12.3C18.4 16.9 16.4 21.3 16 26.1 15.6 21.3 13.6 16.9 9.8 13.8 13.6 10.7 15.6 6.3 16 1.5Z" />
      <path d="M25.5 6c.2 2.2 1.1 4.2 2.8 5.6-1.7 1.4-2.6 3.4-2.8 5.6-.2-2.2-1.1-4.2-2.8-5.6 1.7-1.4 2.6-3.4 2.8-5.6Z" opacity=".7" />
    </svg>
  );
}

export function Leaf({ className = 'w-16 h-16 text-gold-400/40', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M12 62c18-6 32-22 40-42 8 4 16 14 18 28-14 8-34 16-58 14Z"
        fill="currentColor"
        opacity=".35"
      />
      <path
        d="M18 58c16-8 28-22 34-38"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlobePins({ className = 'w-full h-full', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 280 280" fill="none" aria-hidden className={className} {...props}>
      <circle cx="140" cy="140" r="108" stroke="#F5C242" strokeOpacity=".25" strokeWidth="1.2" />
      <circle cx="140" cy="140" r="78" stroke="#F7F4EC" strokeOpacity=".15" strokeWidth="1" />
      <ellipse cx="140" cy="140" rx="108" ry="42" stroke="#B7C3D9" strokeOpacity=".35" />
      <ellipse cx="140" cy="140" rx="42" ry="108" stroke="#B7C3D9" strokeOpacity=".25" />
      <path d="M32 140h216M140 32v216" stroke="#B7C3D9" strokeOpacity=".2" />
      <circle cx="168" cy="98" r="5" fill="#F5C242" />
      <circle cx="168" cy="98" r="10" stroke="#F5C242" strokeOpacity=".4" />
      <circle cx="112" cy="156" r="4" fill="#FF7A59" />
      <circle cx="196" cy="168" r="4" fill="#F5C242" />
      <text x="140" y="248" textAnchor="middle" fill="#B7C3D9" fontSize="11" fontFamily="Inter, sans-serif">
        Tunis · Tunisie
      </text>
    </svg>
  );
}

export function DonationBoxSvg({ className = 'w-20 h-20', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={className} {...props}>
      <rect x="16" y="34" width="48" height="32" rx="6" fill="#223A5E" />
      <rect x="16" y="26" width="48" height="14" rx="5" fill="#4A90D9" />
      <rect x="34" y="30" width="12" height="4" rx="2" fill="#1B2A4A" />
      <circle cx="52" cy="20" r="8" fill="#F5C242" />
      <circle cx="52" cy="20" r="5.5" stroke="#E8A93A" strokeWidth="1.2" />
    </svg>
  );
}

const AID_PATHS: Record<string, string> = {
  FOOD: 'M16 44c8-18 24-18 32 0v8H16v-8Zm8-20a8 8 0 1 1 16 0',
  MEDICINE: 'M28 16h8v12h12v8H36v12h-8V36H16v-8h12V16Z',
  FINANCIAL: 'M32 14v36M22 22h16a8 8 0 0 1 0 16H22',
  SOCIAL: 'M24 28a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm16 0a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 50c0-8 8-12 12-12s12 4 12 12M32 50c0-8 8-12 12-12s12 4 12 12',
  OTHER: 'M32 14 38 28h16L42 36l6 16-16-10-16 10 6-16-12-8h16L32 14Z',
};

export function AidTypeMark({ type, className = 'w-16 h-16' }: { type: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#1B2A4A" />
      <path
        d={AID_PATHS[type] || AID_PATHS.OTHER}
        stroke="#F5C242"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
