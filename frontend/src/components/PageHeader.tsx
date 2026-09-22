import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold text-navy-900 leading-[1.05]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base md:text-lg text-navy-700/70 leading-relaxed">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
